<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Models\MigrateMediaModel;
use App\Models\MigratePlacesHistoryModel;
use App\Models\MigratePlacesModel;
use App\Models\MigrateUsersModel;
use App\Models\PhotosModel;
use App\Models\PlacesTagsModel;
use App\Models\TagsModel;
use App\Models\TranslationsPhotosModel;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\TranslationsPlacesModel;
use App\Models\UsersActivityModel;
use App\Models\UsersModel;
use CodeIgniter\Files\File;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;
use Geocoder\Exception\Exception;
use ReflectionException;

define('MAX_PLACES_PER_ITERATION', 2);

class Migrate extends ResourceController {
    /**
     * @throws Exception|ReflectionException
     */
    public function init(): ResponseInterface {
        $mapCategories = [
            1 => 'abandoned',     // Заброшенные
            2 => 'construction',  // Техногенные
            3 => 'nature',        // Природные
            4 => 'mine',          // Карьеры
            5 => 'water',         // Водохранилища
            6 => 'spring',        // Родники
            7 => 'camping',       // Кемпинги
            8 => 'castle',        // Крепости
            9 => 'religious',     // Монастыри
            10 => 'museum',       // Музеи
            11 => 'memorial',     // Статуи
            12 => 'manor',        // Усадьбы
            13 => 'cave',         // Пещеры
            14 => 'fort',         // Доты
            15 => 'mountain',     // Горы
            16 => 'construction', // Другое
        ];

        $ratingModel = new RatingModel();
        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();

        $translationsPlacesModel = new TranslationsPlacesModel();
        $translationsPhotosModel = new TranslationsPhotosModel();

        $activityModel  = new UsersActivityModel();
        $migratePlaces  = new MigratePlacesModel();
        $migrateHistory = new MigratePlacesHistoryModel();
        $migrateMedia   = new MigrateMediaModel();

        $migratePlace = $migratePlaces->orderBy('item_id')->findAll();

        $inserted = [];

        foreach ($migratePlace as $item) {
            if ($translationsPlacesModel
                ->where('title', strip_tags(html_entity_decode($item->item_title)))
                ->join('places', 'translations_places.place_id = places.id')
                ->first()
            ) {
                continue;
            }

            // Calculate rating
            $ratingSum  = 0;
            $ratingData = unserialize($item->item_rating);

            if ($ratingData && is_array($ratingData['scores'])) {
                foreach ($ratingData['scores'] as $score) {
                    $ratingSum += $score;
                }

                $ratingSum = $ratingSum / count($ratingData['scores']);
            }

            // Add or update user
            $placeAuthor = $this->_migrate_user($item->item_author);

            // Place version timestamp
            $placeVersionDate = (int) $item->item_version_date !== 0 ? $item->item_version_date : $item->item_datestamp;

            $geocoder = new Geocoder($item->item_latitude, $item->item_longitude);
            $place    = new \App\Entities\Place();

            $place->latitude         = $item->item_latitude;
            $place->longitude        = $item->item_longitude;
            $place->user_id          = $placeAuthor;
            $place->rating           = $ratingSum === 0 ? null : $ratingSum;
            $place->views            = $item->item_count_views;
            $place->category         = $mapCategories[$item->item_category];
            $place->address          = $geocoder->address;
            $place->address_country  = $geocoder->countryID;
            $place->address_region   = $geocoder->regionID;
            $place->address_district = $geocoder->districtID;
            $place->address_city     = $geocoder->cityID;
            $place->created_at       = $item->item_datestamp;
            $place->updated_at       = $placeVersionDate;

            $placesModel->insert($place);

            $newPlaceId = $placesModel->getInsertID();

            // Add new tags
            $tagsArray = explode(',', $item->item_tags);
            if (!empty($tagsArray)) {
                foreach ($tagsArray as $tag) {
                    $this->_migrate_tags($tag, $newPlaceId);
                }
            }

            $placeTitle   = strip_tags(html_entity_decode($item->item_title));
            $placeContent = strip_tags(html_entity_decode($item->item_content));

            // Migrate content history
            $placeVersions = $migrateHistory
                ->where('item_object_id', $item->item_id)
                ->orderBy('item_datestamp', 'DESC')
                ->findAll();

            // Make translation for current version
            $translation = new \App\Entities\TranslationPlace();
            $translation->place_id   = $newPlaceId;
            $translation->language   = 'ru';
            $translation->user_id    = $placeAuthor;
            $translation->title      = $placeTitle;
            $translation->content    = $placeContent;
            $translation->delta      = $item->item_version_date !== 0 && count($placeVersions) > 0 ? strlen($placeContent) - strlen(strip_tags(html_entity_decode($placeVersions[count($placeVersions) - 1]->item_content))) : 0;
            $translation->created_at = $placeVersionDate;
            $translationsPlacesModel->insert($translation);

            // Make user activity
            $activity = new \App\Entities\UserActivity();
            $activity->type       = $item->item_version_date !== 0 ? 'edit' : 'place';
            $activity->user_id    = $placeAuthor;
            $activity->place_id   = $newPlaceId;
            $activity->created_at = $placeVersionDate;
            $activityModel->insert($activity);

            if (!empty($placeVersions)) {
                foreach ($placeVersions as $key => $placeVersionItem) {
                    $versionContent = strip_tags(html_entity_decode($placeVersionItem->item_content));
                    $versionDelta   = $key === 0 ? 0 : strlen($placeContent) - strlen($versionContent);
//                    // If in version text nothing changed
//                    if ($versionDelta === 0) {
//                        continue ;
//                    }

                    $historyUser = $this->_migrate_user($placeVersionItem->item_author);
                    $translation = new \App\Entities\TranslationPlace();
                    $translation->place_id   = $newPlaceId;
                    $translation->language   = 'ru';
                    $translation->user_id    = $historyUser;
                    $translation->title      = $placeTitle;
                    $translation->content    = $versionContent;
                    $translation->delta      = $versionDelta;
                    $translation->created_at = $placeVersionItem->item_datestamp;
                    $translationsPlacesModel->insert($translation);

                    $activity = new \App\Entities\UserActivity();
                    $activity->type       = $key === 0 ? 'place' : 'edit';
                    $activity->user_id    = $historyUser;
                    $activity->place_id   = $newPlaceId;
                    $activity->created_at = $placeVersionItem->item_datestamp;
                    $activityModel->insert($activity);
                }
            }

            // Migrate Rating
            if (is_array($ratingData) &&  is_array($ratingData['scores']) && !empty($ratingData['scores'])) {
                foreach ($ratingData['scores'] as $index => $score) {
                    if (!$score) {
                        continue;
                    }

                    $randomDate   = mt_rand($item->item_datestamp, time());
                    $ratingAuthor = isset($ratingData['users'][$index]) ? $this->_migrate_user($item->item_author) : null;

                    $rating = new \App\Entities\Rating();
                    $rating->place_id   = $newPlaceId;
                    $rating->user_id    = $ratingAuthor;
                    $rating->value      = (int) $score;
                    $rating->created_at = $randomDate;

                    $ratingModel->insert($rating);

                    $activity = new \App\Entities\UserActivity();
                    $activity->type       = 'rating';
                    $activity->user_id    = $ratingAuthor ?? null;
                    $activity->place_id   = $newPlaceId;
                    $activity->rating_id  = $ratingModel->getInsertID();
                    $activity->created_at = $randomDate;

                    $activityModel->insert($activity);
                }
            }

            // Migrate Photos
            $photos = json_decode($item->item_photos);

            if (is_array($photos)) {
                if (!is_dir(UPLOAD_PHOTOS)) {
                    mkdir(UPLOAD_PHOTOS,0777, TRUE);
                }

                foreach ($photos as $photoID) {
                    $currentPhoto = $migrateMedia->find($photoID);

                    if ($photosModel->where(['filename' => $currentPhoto->item_filename])->withDeleted()->first()) {
                        continue;
                    }

                    if ($currentPhoto) {
                        // Download photo
                        $photoFilename  = $currentPhoto->item_filename . '.' . $currentPhoto->item_ext;
                        $fileImageURL   = 'https://greenexp.ru/uploads/places/' . $item->item_directory . '/' . $photoFilename;
                        $photoDirectory = UPLOAD_PHOTOS . '/' . $newPlaceId;
                        if (!is_dir($photoDirectory)) {
                            mkdir($photoDirectory,0777, TRUE);
                        }

                        try {
                            $photoData = @file_get_contents($fileImageURL);

                            if (empty($photoData)) {
                                continue;
                            }

                            file_put_contents($photoDirectory . '/' . $photoFilename, $photoData);

                            $file = new File($photoDirectory . '/' . $photoFilename);
                            list($width, $height) = getimagesize($file->getRealPath());
                            $image = Services::image('gd'); // imagick
                            $image->withFile($file->getRealPath())
                                ->fit(512, 384, 'center')
                                ->save($photoDirectory . '/' . $currentPhoto->item_filename . '_thumb.' . $file->getExtension());

                            // Add or update user
                            $photoAuthor = $this->_migrate_user($item->item_author);

                            // Save photo to DB
                            $photo = new \App\Entities\Photo();
                            $photo->latitude   = $currentPhoto->item_latitude;
                            $photo->longitude  = $currentPhoto->item_longitude;
                            $photo->place_id   = $newPlaceId;
                            $photo->user_id    = $photoAuthor;
                            $photo->filename   = $currentPhoto->item_filename;
                            $photo->extension  = $currentPhoto->item_ext;
                            $photo->filesize   = $file->getSize();
                            $photo->width      = $width;
                            $photo->height     = $height;
                            $photo->created_at = $currentPhoto->item_timestamp + 60;

                            $photosModel->insert($photo);

                            sleep(0.2);

                            // Make translation
                            $translationsPhotosModel->insert([
                                'photo_id' => $photosModel->getInsertID(),
                                'language' => 'ru',
                                'title'    => strip_tags(html_entity_decode($item->item_title)) ?? ''
                            ]);

                            sleep(0.2);

                            $activity = new \App\Entities\UserActivity();
                            $activity->type       = 'photo';
                            $activity->user_id    = $placeAuthor;
                            $activity->place_id   = $newPlaceId;
                            $activity->photo_id   = $photosModel->getInsertID();
                            $activity->created_at = $photo->created_at;

                            // Make user activity
                            $activityModel->insert($activity);
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }

            $inserted[] = $item->item_title;

            if (count($inserted) >= MAX_PLACES_PER_ITERATION) {
                return $this->respond($inserted);
            }
        }

        return $this->respond($inserted);
    }

    /**
     * @param string $tag
     * @param string $placeId
     * @return void
     * @throws ReflectionException
     */
    protected function _migrate_tags(string $tag, string $placeId): void {
        if (!$tag || !$placeId) {
            return ;
        }

        $tagsModel = new TagsModel();
        $placesTagsModel = new PlacesTagsModel();

        $tagData = $tagsModel->where(['title' => $tag])->first();

        if (!$tagData) {
            $tagsModel->insert([
                'title'   => $tag,
                'counter' => 1
            ]);

            $placesTagsModel->insert([
                'tag_id'   => $tagsModel->getInsertID(),
                'place_id' => $placeId
            ]);

        } else {
            $tagsModel->update($tagData->id, ['counter' => $tagData->counter + 1]);
            $placesTagsModel->insert([
                'tag_id'   => $tagData->id,
                'place_id' => $placeId
            ]);
        }
    }

    /**
     * @param string $author_id
     * @return string
     * @throws ReflectionException
     */
    protected function _migrate_user(string $author_id): string {
        $usersModel   = new UsersModel();
        $migrateUsers = new MigrateUsersModel();

        $userMigrateData = $migrateUsers->find($author_id);
        $userData = $usersModel->where(['email' => $userMigrateData->user_email])->first();

        if ($userData && $userData->id) {
            return $userData->id;
        }

        $userAvatarURL   = 'https://greenexp.ru/uploads/avatars/' . $userMigrateData->user_avatar;
        $avatarDirectory = UPLOAD_AVATARS;
        if (!is_dir($avatarDirectory)) {
            mkdir($avatarDirectory,0777, TRUE);
        }

        file_put_contents($avatarDirectory . '/' . $userMigrateData->user_avatar, file_get_contents($userAvatarURL));

        $user = new \App\Entities\User();
        $user->name       = $userMigrateData->user_name;
        $user->password   = $userMigrateData->user_password;
        $user->email      = $userMigrateData->user_email;
        $user->level      = 0;
        $user->reputation = $userMigrateData->user_rating;
        $user->website    = $userMigrateData->user_website;
        $user->avatar     = $userMigrateData->user_avatar;
        $user->created_at = date($userMigrateData->user_regdate);

        $usersModel->insert($user);

        return $usersModel->getInsertID();
    }
}