<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Models\MigrateMediaModel;
use App\Models\MigratePlacesModel;
use App\Models\MigrateUsersModel;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\RatingModel;
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
            1 => ['man_made', 'ruins'],         // Заброшенные
            2 => ['man_made', null],            // Техногенные
            3 => ['natural', null],             // Природные
            4 => ['man_made', 'mine'],          // Карьеры
            5 => ['natural', 'water'],          // Водохранилища
            6 => ['natural', 'spring'],         // Родники
            7 => ['tourism', 'camping'],        // Кемпинги
            8 => ['historic', 'fort'],          // Крепости
            9 => ['historic', 'religious'],     // Монастыри
            10 => ['tourism', 'museum'],        // Музеи
            11 => ['historic', 'memorial'],     // Статуи
            12 => ['historic', 'manor'],        // Усадьбы
            13 => ['natural', 'cave_entrance'], // Пещеры
            14 => ['historic', 'battlefield'],  // Доты
            15 => ['natural', 'rock'],          // Горы
            16 => ['tourism', null],            // Другое
        ];

        $ratingModel = new RatingModel();
        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();

        $migratePlaces = new MigratePlacesModel();
        $migrateMedia  = new MigrateMediaModel();

        $migratePlace = $migratePlaces->findAll();

        $inserted = [];

        foreach ($migratePlace as $item) {
            if ($placesModel->where('title', $item->item_title)->withDeleted()->first()) {
                continue;
            }

            // Calculate rating
            $ratingSum  = 0;
            $ratingData = unserialize($item->item_rating);

            if (is_array($ratingData['scores']) && !empty($ratingData['scores'])) {
                foreach ($ratingData['scores'] as $score) {
                    $ratingSum += $score;
                }

                $ratingSum = $ratingSum / count($ratingData['scores']);
            }

            $placeAuthor = $this->_migrate_user($item->item_author);

            $geocoder = new Geocoder($item->item_latitude, $item->item_longitude);
            $place    = new \App\Entities\Place();

            $place->latitude         = $item->item_latitude;
            $place->longitude        = $item->item_longitude;
            $place->author           = $placeAuthor;
            $place->rating           = $ratingSum === 0 ? null : $ratingSum;
            $place->views            = $item->item_count_views;
            $place->category         = $mapCategories[$item->item_category][0];
            $place->subcategory      = $mapCategories[$item->item_category][1];
            $place->title            = $item->item_title;
            $place->content          = strip_tags(html_entity_decode($item->item_content));
            $place->tags             = (object) ['hashcodes' => explode(',', $item->item_tags)];
            $place->address          = $geocoder->address;
            $place->address_country  = $geocoder->countryID;
            $place->address_region   = $geocoder->regionID;
            $place->address_district = $geocoder->districtID;
            $place->address_city     = $geocoder->cityID;
            $place->created_at       = date($item->item_datestamp);

            $placesModel->insert($place);

            $newPlaceId = $placesModel->getInsertID();

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

                        $photoAuthor = $this->_migrate_user($item->item_author);

                        // Save photo to DB
                        $photo = new \App\Entities\Photo();
                        $photo->title     = $place->title;
                        $photo->latitude  = $currentPhoto->item_latitude;
                        $photo->longitude = $currentPhoto->item_longitude;
                        $photo->place     = $newPlaceId;
                        $photo->author    = $photoAuthor;
                        $photo->filename  = $currentPhoto->item_filename;
                        $photo->extension = $currentPhoto->item_ext;
                        $photo->filesize  = $file->getSize();
                        $photo->width     = $width;
                        $photo->height    = $height;

                        $photo->created_at = date($currentPhoto->item_timestamp);
                    }

                    $photosModel->insert($photo);
                }
            }

            $inserted[] = $item->item_title;

            echo '<pre>';
            var_dump($place);
            exit();
        }

        return $this->respond($inserted);
    }

    protected function _migrate_user(string $author_id): string {
        $usersModel   = new UsersModel();
        $migrateUsers = new MigrateUsersModel();

        $userMigrateData = $migrateUsers->find($author_id);
        $userData = $usersModel->where(['email' => $userMigrateData->user_email])->first();

        if (!$userData) {
            $user    = new \App\Entities\User();
            $user->name       = $userMigrateData->user_name;
            $user->password   = $userMigrateData->user_password;
            $user->email      = $userMigrateData->user_email;
            $user->level      = 0;
            $user->reputation = $userMigrateData->user_rating;
            $user->created_at = date($userMigrateData->user_regdate);

            $usersModel->insert($user);

            return $usersModel->getInsertID();
        }

        return $userData->id;
    }
}