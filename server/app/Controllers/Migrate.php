<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Libraries\LevelsLibrary;
use App\Models\MigrateMediaModel;
use App\Models\MigratePlacesComments;
use App\Models\MigratePlacesHistoryModel;
use App\Models\MigratePlacesModel;
use App\Models\MigrateUsersModel;
use App\Models\PhotosModel;
use App\Models\CommentsModel;
use App\Models\PlacesTagsModel;
use App\Models\TagsModel;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\PlacesContentModel;
use App\Models\ActivityModel;
use App\Models\UsersModel;
use CodeIgniter\Files\File;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;
use Geocoder\Exception\Exception;
use JetBrains\PhpStorm\NoReturn;
use ReflectionException;

define('MAX_PLACES_PER_ITERATION', 50);

set_time_limit(0);

function searchImage($directory) {
    // Открываем директорию для чтения
    $dirHandle = opendir($directory);

    // Проходим по содержимому директории
    while (($file = readdir($dirHandle)) !== false) {
        // Пропускаем специальные директории . и ..
        if ($file == "." || $file == "..") {
            continue;
        }

        // Формируем полный путь к файлу
        $filePath = $directory . "/" . $file;

        // Если это директория, рекурсивно вызываем функцию для поиска в ней
        if (is_dir($filePath)) {
            searchImage($filePath);
        }

        // Проверяем, соответствует ли файл имени изображения
        if (is_file($filePath) && pathinfo($filePath, PATHINFO_FILENAME) == 'cover') {
            // Если найдено изображение с указанным именем, возвращаем путь к нему
            list($width, $height) = getimagesize($filePath);

            if ($width > PLACE_COVER_WIDTH && $height > PLACE_COVER_HEIGHT) {
                $image = Services::image('gd'); // imagick
                $image->withFile($filePath)
                    ->fit(PLACE_COVER_WIDTH, PLACE_COVER_HEIGHT)
                    ->save($filePath);

                echo $filePath;
            }
        }
    }

    // Закрываем дескриптор директории
    closedir($dirHandle);

    // Если изображение с указанным именем не найдено, возвращаем false
    return false;
}

class Migrate extends ResourceController {

    public function fixedCoverSizes(): void {
        searchImage(UPLOAD_PHOTOS);
    }

    /**
     * php index.php migrate fix
     * @throws ReflectionException
     */
    public function fixedActivity(): void {
        $placesModel   = new PlacesModel();
        $photosModel   = new PhotosModel();
        $contentModel  = new PlacesContentModel();
        $ratingsModel  = new RatingModel();

        $activityModel = new ActivityModel();
        $usersModel    = new UsersModel();
        $usersData     = $usersModel->select('id, name, level, experience')->findAll();

        $counter = 0 ;

        foreach ($usersData as $user) {
            // Places
            $placesIds  = [];
            $placesData = $placesModel->select('id, created_at')->where('user_id', $user->id)->findAll();
            if ($placesData) {
                foreach ($placesData as $place) {
                    $activity = new \App\Entities\Activity();
                    $activity->type       = 'place';
                    $activity->session_id = null;
                    $activity->user_id    = $user->id;
                    $activity->photo_id   = null;
                    $activity->place_id   = $place->id;
                    $activity->rating_id  = null;
                    $activity->created_at = $place->created_at;
                    $activityModel->insert($activity);

                    $placesIds[] = $place->id;
                }
            }

            // Photos
            $photosData = $photosModel->select('id, place_id, created_at')->where('user_id', $user->id)->findAll();
            if ($photosData) {
                foreach ($photosData as $photo) {
                    $activity = new \App\Entities\Activity();
                    $activity->type       = 'photo';
                    $activity->session_id = null;
                    $activity->user_id    = $user->id;
                    $activity->photo_id   = $photo->id;
                    $activity->place_id   = $photo->place_id;
                    $activity->rating_id  = null;
                    $activity->created_at = $photo->created_at;
                    $activityModel->insert($activity);
                }
            }

            // Ratings
            $ratingData = $ratingsModel->select('id, place_id, created_at')->where('user_id', $user->id)->findAll();
            if ($ratingData) {
                foreach ($ratingData as $rating) {
                    $activity = new \App\Entities\Activity();
                    $activity->type       = 'rating';
                    $activity->session_id = null;
                    $activity->user_id    = $user->id;
                    $activity->photo_id   = null;
                    $activity->place_id   = $rating->place_id;
                    $activity->rating_id  = $rating->id;
                    $activity->created_at = $rating->created_at;
                    $activityModel->insert($activity);
                }
            }

            // Content
            $contentData = $contentModel->select('id, place_id, created_at')->where('user_id', $user->id)->orderBy('created_at', 'ASC')->findAll();
            if ($contentData) {
                $userContentPlaces = [];

                foreach ($contentData as $content) {
                    if (
                        in_array($content->place_id, $placesIds) && // Если пользователь автор места
                        !in_array($content->place_id, $userContentPlaces) // Если это перый place ID в итерации
                    ) {
                        $userContentPlaces[] = $content->place_id;
                        continue;
                    }

                    $activity = new \App\Entities\Activity();
                    $activity->type       = 'edit';
                    $activity->session_id = null;
                    $activity->user_id    = $user->id;
                    $activity->photo_id   = null;
                    $activity->place_id   = $content->place_id;
                    $activity->rating_id  = null;
                    $activity->created_at = $content->created_at;
                    $activityModel->insert($activity);
                }
            }

            $userLevels = new LevelsLibrary();
            $userLevels->calculate($user);

            $counter++;

        }

        echo "Completed: " . $counter;

        $ratingSessionData = $ratingsModel->where(['user_id' => null, 'session_id !=' => null])->findAll();
        if ($ratingSessionData) {
            foreach ($ratingSessionData as $ratingItem) {
                $activity = new \App\Entities\Activity();
                $activity->type       = 'edit';
                $activity->session_id = $ratingItem->session_id;
                $activity->user_id    = null;
                $activity->photo_id   = null;
                $activity->place_id   = $ratingItem->place_id;
                $activity->rating_id  = null;
                $activity->created_at = $ratingItem->created_at;
                $activityModel->insert($activity);
            }
        }
    }

    /**
     * $: cd public
     * $: php index.php migrate users
     * @throws ReflectionException
     */
    #[NoReturn] public function users(): void {
        $counter = 0;
        $migrateUsers = new MigrateUsersModel();
        $allUsersData = $migrateUsers->findAll();

        foreach ($allUsersData as $user) {
            $counter++;
            $this->_migrate_user($user->user_id);
        }

        echo 'Migration Finished: ' . $counter;

        exit();
    }

    /**
     * $: cd public
     * $: php index.php migrate comments
     * @throws ReflectionException
     */
    #[NoReturn] public function comments(): void {
        $counter = 0;
        $migratePlaces   = new MigratePlacesModel();
        $migrateComments = new MigratePlacesComments();
        $commentsModel   = new CommentsModel();
        $activityModel   = new ActivityModel();
        $placesModel     = new PlacesModel();

        $placesCounter = [];

        $rootCommentsData = $migrateComments
            ->where(['item_type' => 'places', 'item_answer' => 0])
            ->findAll();

        foreach ($rootCommentsData as $comment) {
            $migratePlace = $migratePlaces->select('migrate_id')->where('item_id', $comment->item_material)->first();

            if (!$migratePlace || $comment->migrate_id) {
                continue;
            }

            $userId = $this->_migrate_user($comment->item_author);

            $commentEntity = new \App\Entities\Comment();
            $commentEntity->place_id   = $migratePlace->migrate_id;
            $commentEntity->user_id    = $userId;
            $commentEntity->content    = strip_tags(html_entity_decode($comment->item_comment));
            $commentEntity->created_at = $comment->item_datestamp;
            $commentEntity->updated_at = $comment->item_datestamp;
            $commentsModel->insert($commentEntity);

            $commentId = $commentsModel->getInsertID();

            $activity = new \App\Entities\Activity();
            $activity->type       = 'comment';
            $activity->user_id    = $userId;
            $activity->place_id   = $migratePlace->migrate_id;
            $activity->comment_id = $commentId;
            $activity->created_at = $comment->item_datestamp;
            $activityModel->insert($activity);

            $migrateComments->update($comment->item_id, ['migrate_id' => $commentId]);

            if (isset($placesCounter[$migratePlace->migrate_id])) {
                $placesCounter[$migratePlace->migrate_id] += 1;
            } else {
                $placesCounter[$migratePlace->migrate_id] = 1;
            }

            $counter++;
        }

        $answerCommentsData = $migrateComments
            ->where(['item_type' => 'places', 'item_answer !=' => 0])
            ->findAll();

        foreach ($answerCommentsData as $comment) {
            $migratePlace   = $migratePlaces->select('migrate_id')->where('item_id', $comment->item_material)->first();
            $migrateComment = $migrateComments->select('migrate_id')->where('item_id', $comment->item_answer)->first();

            if (!$migratePlace || !$migrateComment || $comment->migrate_id) {
                continue;
            }

            $userId = $this->_migrate_user($comment->item_author);

            $commentEntity = new \App\Entities\Comment();
            $commentEntity->place_id   = $migratePlace->migrate_id;
            $commentEntity->user_id    = $userId;
            $commentEntity->content    = strip_tags(html_entity_decode($comment->item_comment));
            $commentEntity->answer_id  = $migrateComment->migrate_id;
            $commentEntity->created_at = $comment->item_datestamp;
            $commentEntity->updated_at = $comment->item_datestamp;
            $commentsModel->insert($commentEntity);

            $commentId = $commentsModel->getInsertID();

            $activity = new \App\Entities\Activity();
            $activity->type       = 'comment';
            $activity->user_id    = $userId;
            $activity->place_id   = $migratePlace->migrate_id;
            $activity->comment_id = $commentId;
            $activity->created_at = $comment->item_datestamp;
            $activityModel->insert($activity);

            $migrateComments->update($comment->item_id, ['migrate_id' => $commentId]);

            if (isset($placesCounter[$migratePlace->migrate_id])) {
                $placesCounter[$migratePlace->migrate_id] += 1;
            } else {
                $placesCounter[$migratePlace->migrate_id] = 1;
            }

            $counter++;
        }

        if (!empty($placesCounter)) {
            foreach ($placesCounter as $key => $item) {
                $data = $placesModel->select('updated_at')->find($key);

                $placesModel->update($key, ['comments' => $item, 'updated_at' => $data->updated_at]);
            }
        }

        echo 'Migration Finished: ' . $counter;

        exit();
    }

    /**
     * $: cd public
     * $: php index.php migrate places
     * @throws Exception|ReflectionException
     */
    public function places(): void {
        ob_start();

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
            14 => 'military',     // Доты
            15 => 'mountain',     // Горы
            16 => 'construction', // Другое
        ];

        $ratingModel = new RatingModel();
        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();

        $placesContentModel = new PlacesContentModel();

        $activityModel  = new ActivityModel();
        $migratePlaces  = new MigratePlacesModel();
        $migrateHistory = new MigratePlacesHistoryModel();
        $migrateMedia   = new MigrateMediaModel();

        $migratePlace = $migratePlaces->orderBy('item_id')->findAll();

        $inserted = [];

        foreach ($migratePlace as $item) {
//            if ($placesContentModel
//                ->where('title', strip_tags(html_entity_decode($item->item_title)))
//                ->join('places', 'places_content.place_id = places.id')
//                ->first()
//            ) {
//                continue;
//            }

            if ($item->migrate_id !== null) {
                continue;
            }

            // Calculate rating
            $ratingSum  = 0;
            $ratingData = unserialize($item->item_rating);

            if ($ratingData && is_array($ratingData['scores'])) {
                foreach ($ratingData['scores'] as $score) {
                    $ratingSum += $score;
                }
            }

            // unserialize photos
            $photos = $item->item_photos ? json_decode($item->item_photos) : [];

            // Add or update user
            $placeAuthor = $this->_migrate_user($item->item_author);

            // Place version timestamp
            $placeVersionDate = (int) $item->item_version_date !== 0 ? $item->item_version_date : $item->item_datestamp;

            $geocoder = new Geocoder();
            $place    = new \App\Entities\Place();

            $geocoder->coordinates($item->item_latitude, $item->item_longitude);

            $place->lat         = $item->item_latitude;
            $place->lon         = $item->item_longitude;
            $place->user_id     = $placeAuthor;
            $place->rating      = $ratingSum === 0 ? null : round($ratingSum / count($ratingData['scores']), 1);
            $place->views       = $item->item_count_views;
            $place->photos      = count($photos) ?? 0;
            $place->category    = $mapCategories[$item->item_category];
            $place->address_ru  = $geocoder->addressRu;
            $place->address_en  = $geocoder->addressEn;
            $place->country_id  = $geocoder->countryId;
            $place->region_id   = $geocoder->regionId;
            $place->district_id = $geocoder->districtId;
            $place->locality_id = $geocoder->localityId;
            $place->created_at  = $item->item_datestamp;
            $place->updated_at  = $placeVersionDate;

            $placesModel->insert($place);

            $newPlaceId = $placesModel->getInsertID();

            $migratePlaces->update($item->item_id, ['migrate_id' => $newPlaceId]);

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

            // Make Content for current version
            $content = new \App\Entities\PlaceContent();
            $content->place_id   = $newPlaceId;
            $content->locale     = 'ru';
            $content->user_id    = $placeAuthor;
            $content->title      = $placeTitle;
            $content->content    = $placeContent;
            $content->delta      = $item->item_version_date !== 0 && count($placeVersions) > 0 ? strlen($placeContent) - strlen(strip_tags(html_entity_decode($placeVersions[count($placeVersions) - 1]->item_content))) : 0;
            $content->created_at = $placeVersionDate;
            $placesContentModel->insert($content);

            // Make user activity
            $activity = new \App\Entities\Activity();
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
                    $content = new \App\Entities\PlaceContent();
                    $content->place_id   = $newPlaceId;
                    $content->locale     = 'ru';
                    $content->user_id    = $historyUser;
                    $content->title      = $placeTitle;
                    $content->content    = $versionContent;
                    $content->delta      = $versionDelta;
                    $content->created_at = $placeVersionItem->item_datestamp;
                    $placesContentModel->insert($content);

                    $activity = new \App\Entities\Activity();
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

                    $activity = new \App\Entities\Activity();
                    $activity->type       = 'rating';
                    $activity->user_id    = $ratingAuthor ?? null;
                    $activity->place_id   = $newPlaceId;
                    $activity->rating_id  = $ratingModel->getInsertID();
                    $activity->created_at = $randomDate;

                    $activityModel->insert($activity);
                }
            }

            // Migrate Photos
            if (is_array($photos)) {
                if (!is_dir(UPLOAD_PHOTOS)) {
                    mkdir(UPLOAD_PHOTOS,0777, TRUE);
                }

                foreach ($photos as $index => $photoID) {
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
                                ->fit(PHOTO_PREVIEW_WIDTH, PHOTO_PREVIEW_HEIGHT, 'center')
                                ->save($photoDirectory . '/' . $currentPhoto->item_filename . '_preview.' . $file->getExtension());

                            // If first photo - we automated make place cover
                            if ($index === 0) {
                                $image->withFile($file->getRealPath())
                                    ->fit(PLACE_COVER_WIDTH, PLACE_COVER_HEIGHT, 'center')
                                    ->save($photoDirectory . '/cover.jpg');

                                $image->withFile($file->getRealPath())
                                    ->fit(PLACE_COVER_PREVIEW_WIDTH, PLACE_COVER_PREVIEW_HEIGHT, 'center')
                                    ->save($photoDirectory . '/cover_preview.jpg');
                            }

                            // Add or update user
                            $photoAuthor = $this->_migrate_user($item->item_author);

                            // Save photo to DB
                            $photo = new \App\Entities\Photo();
                            $photo->lat        = $currentPhoto->item_latitude;
                            $photo->lon        = $currentPhoto->item_longitude;
                            $photo->place_id   = $newPlaceId;
                            $photo->user_id    = $photoAuthor;
                            $photo->title_en   = '';
                            $photo->title_ru   = strip_tags(html_entity_decode($item->item_title)) ?? '';
                            $photo->filename   = $currentPhoto->item_filename;
                            $photo->extension  = $currentPhoto->item_ext;
                            $photo->filesize   = $file->getSize();
                            $photo->width      = $width;
                            $photo->height     = $height;
                            $photo->created_at = $currentPhoto->item_timestamp + 60;

                            $photosModel->insert($photo);

                            sleep(0.2);

                            $activity = new \App\Entities\Activity();
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

            echo count($inserted) . ": " . $item->item_title . PHP_EOL;

            flush();
            ob_flush();

            if (count($inserted) >= MAX_PLACES_PER_ITERATION) {
                echo "COMPLETED" . PHP_EOL;
                exit();
//                return $this->respond($inserted);
            }
        }

        ob_end_flush();

        echo "COMPLETED" . PHP_EOL;
//        return $this->respond($inserted);
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

        $tagData = $tagsModel->where(['title_ru' => $tag])->first();

        if (!$tagData) {
            $tagsModel->insert(['title_ru' => $tag]);

            $placesTagsModel->insert([
                'tag_id'   => $tagsModel->getInsertID(),
                'place_id' => $placeId
            ]);

        } else {
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

        $user = new \App\Entities\User();
        $user->name       = $userMigrateData->user_name;
        $user->password   = $userMigrateData->user_password;
        $user->email      = $userMigrateData->user_email;
        $user->reputation = $userMigrateData->user_rating;
        $user->website    = $userMigrateData->user_website;
        $user->avatar     = $userMigrateData->user_avatar;
        $user->created_at = date($userMigrateData->user_regdate);

        $usersModel->insert($user);

        $userId = $usersModel->getInsertID();

        if ($userMigrateData->user_avatar) {
            $userAvatarURL   = 'https://greenexp.ru/uploads/avatars/' . $userMigrateData->user_avatar;
            $avatarDirectory = UPLOAD_AVATARS . '/' . $userId . '/';
            if (!is_dir($avatarDirectory)) {
                mkdir($avatarDirectory,0777, TRUE);
            }

            $avatarImage = @file_get_contents($userAvatarURL);

            if ($avatarImage) {
                file_put_contents($avatarDirectory . $userMigrateData->user_avatar, $avatarImage);

                $file = new File($avatarDirectory . $userMigrateData->user_avatar);
                $name = pathinfo($file, PATHINFO_FILENAME);
                $ext  = $file->getExtension();

                $image = Services::image('gd'); // imagick
                $image->withFile($file->getRealPath())
                    ->fit(AVATAR_SMALL_WIDTH, AVATAR_SMALL_HEIGHT)
                    ->save($avatarDirectory  . $name . '_small.' . $ext);

                $image->withFile($file->getRealPath())
                    ->fit(AVATAR_MEDIUM_WIDTH, AVATAR_MEDIUM_HEIGHT)
                    ->save($avatarDirectory  . $name . '_medium.' . $ext);

            } else {
                $usersModel->update($userId, ['avatar' => null]);
            }
        }

        return $userId;
    }
}