<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Models\MigrateMediaModel;
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

class Migrate extends ResourceController
{
    /**
     * @throws Exception
     */
    public function init(): ResponseInterface
    {
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

        $TranslationsPlacesModel = new TranslationsPlacesModel();
        $TranslationsPhotosModel = new TranslationsPhotosModel();

        $userActivityModel = new UsersActivityModel();

        $migratePlaces = new MigratePlacesModel();
        $migrateMedia  = new MigrateMediaModel();

        $migratePlace = $migratePlaces->findAll();

        $inserted = [];

        foreach ($migratePlace as $item) {
              if ($TranslationsPlacesModel
                  ->where('title', $item->item_title)
                  ->join('places', 'translations_places.place = places.id')
                  ->first()
              ) {
                  continue;
              }

            // Calculate rating
            $ratingSum  = 0;
            $ratingData = unserialize($item->item_rating);

            if ($ratingData && is_array($ratingData['scores']) && isset($ratingData['scores'])) {
                foreach ($ratingData['scores'] as $score) {
                    $ratingSum += $score;
                }

                $ratingSum = $ratingSum / count($ratingData['scores']);
            }

            // Add or update user
            $placeAuthor = $this->_migrate_user($item->item_author);

            $geocoder = new Geocoder($item->item_latitude, $item->item_longitude);
            $place    = new \App\Entities\Place();

            $place->latitude         = $item->item_latitude;
            $place->longitude        = $item->item_longitude;
            $place->author           = $placeAuthor;
            $place->rating           = $ratingSum === 0 ? null : $ratingSum;
            $place->views            = $item->item_count_views;
            $place->category         = $mapCategories[$item->item_category];
            $place->address          = $geocoder->address;
            $place->address_country  = $geocoder->countryID;
            $place->address_region   = $geocoder->regionID;
            $place->address_district = $geocoder->districtID;
            $place->address_city     = $geocoder->cityID;
            $place->created_at       = date($item->item_datestamp);

            $placesModel->insert($place);

            $newPlaceId = $placesModel->getInsertID();

            // Add new tags
            $tagsArray = explode(',', $item->item_tags);
            if (!empty($tagsArray)) {
                foreach ($tagsArray as $tag) {
                    $this->_migrate_tags($tag, $newPlaceId);
                }
            }

            // Make translation
            $TranslationsPlacesModel->insert((object) [
                'place'    => $newPlaceId,
                'language' => 'ru',
                'title'    => $item->item_title,
                'content'  => strip_tags(html_entity_decode($item->item_content))
            ]);

            // Make user activity
            $userActivityModel->insert((object) [
                'user'       => $placeAuthor,
                'type'       => 'place',
                'place'      => $newPlaceId,
                'created_at' => $place->created_at
            ]);

            // Migrate Rating
            if (is_array($ratingData['scores']) && !empty($ratingData['scores'])) {
                foreach ($ratingData['scores'] as $index => $score) {
                    if (!$score) {
                        continue;
                    }

                    $ratingAuthor = isset($ratingData['users'][$index]) ? $this->_migrate_user($item->item_author) : null;
                    $insertRating = [
                        'place'   => $newPlaceId,
                        'author'  => $ratingAuthor,
                        'session' => null,
                        'value'   => $score,
                    ];

                    $ratingModel->insert($insertRating);

                    // Make user activity
                    if ($ratingAuthor) {
                        $userActivityModel->insert((object) [
                            'user'       => $ratingAuthor,
                            'type'       => 'rating',
                            'rating'     => $ratingModel->getInsertID(),
                            'created_at' => $place->created_at
                        ]);
                    }
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

                        file_put_contents($photoDirectory . '/' . $photoFilename, file_get_contents($fileImageURL));

                        $file = new File($photoDirectory . '/' . $photoFilename);
                        list($width, $height) = getimagesize($file->getRealPath());
                        $image = Services::image('gd'); // imagick
                        $image->withFile($file->getRealPath())
                            ->fit(300, 270, 'center')
                            ->save($photoDirectory . '/' . $currentPhoto->item_filename . '_thumb.' . $file->getExtension());

                        // Add or update user
                        $photoAuthor = $this->_migrate_user($item->item_author);

                        // Save photo to DB
                        $photo = new \App\Entities\Photo();
                        $photo->latitude    = $currentPhoto->item_latitude;
                        $photo->longitude   = $currentPhoto->item_longitude;
                        $photo->place       = $newPlaceId;
                        $photo->author      = $photoAuthor;
                        $photo->filename    = $currentPhoto->item_filename;
                        $photo->extension   = $currentPhoto->item_ext;
                        $photo->filesize    = $file->getSize();
                        $photo->width       = $width;
                        $photo->height      = $height;

                        $photo->created_at = date($currentPhoto->item_timestamp);

                        $photosModel->insert($photo);

                        // Make translation
                        $TranslationsPhotosModel->insert([
                            'photo'    => $photosModel->getInsertID(),
                            'language' => 'ru',
                            'title'    => $item->item_title ?? ''
                        ]);

                        // Make user activity
                        $userActivityModel->insert([
                            'user'       => $placeAuthor,
                            'type'       => 'photo',
                            'photo'      => $photosModel->getInsertID(),
                            'created_at' => $photo->created_at
                        ]);
                    }
                }
            }

            $inserted[] = $item->item_title;

            echo '<pre>';
            var_dump($place);
            exit();
        }

        return $this->respond($inserted);
    }

    protected function _migrate_tags(string $tag, string $placeId) {
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
                'tag'   => $tagsModel->getInsertID(),
                'place' => $placeId
            ]);

        } else {
            $tagsModel->update($tagData->id, ['counter' => $tagData->counter + 1]);
            $placesTagsModel->insert([
                'tag'   => $tagData->id,
                'place' => $placeId
            ]);
        }
    }

    protected function _migrate_user(string $author_id): string {
        $usersModel   = new UsersModel();
        $migrateUsers = new MigrateUsersModel();

        $userMigrateData = $migrateUsers->find($author_id);
        $userData = $usersModel->where(['email' => $userMigrateData->user_email])->first();

        if (!$userData) {
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

        return $userData->id;
    }
}