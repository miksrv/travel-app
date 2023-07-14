<?php namespace App\Controllers;
;
use App\Libraries\Geocoder;
use App\Models\MigrateMediaModel;
use App\Models\MigratePlacesModel;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
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
            10 => ['historic', 'tourism'],      // Музеи
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

            $ratingSum  = 0;
            $ratingData = unserialize($item->item_rating);

            if (is_array($ratingData['scores']) && !empty($ratingData['scores'])) {
                foreach ($ratingData['scores'] as $score) {
                    $ratingSum += $score;
                }

                $ratingSum = $ratingSum / count($ratingData['scores']);
            }

            $geocoder = new Geocoder($item->item_latitude, $item->item_longitude);
            $place    = new \App\Entities\Place();

            $place->latitude         = $item->item_latitude;
            $place->longitude        = $item->item_longitude;
            $place->author           = null;
            $place->rating           = $ratingSum === 0 ? null : $ratingSum;
            $place->views            = $item->item_count_views;
            $place->category         = $mapCategories[$item->item_category][0];
            $place->subcategory      = $mapCategories[$item->item_category][1];
            $place->title            = $item->item_title;
            $place->content          = $item->item_content;
            $place->tags             = (object) ['hashcodes' => explode(',', $item->item_tags)];
            $place->address          = $geocoder->address;
            $place->address_country  = $geocoder->countryID;
            $place->address_region   = $geocoder->regionID;
            $place->address_district = $geocoder->districtID;
            $place->address_city     = $geocoder->cityID;

            $placesModel->insert($place);

            $newPlaceId = $placesModel->getInsertID();

            if (is_array($ratingData['scores']) && !empty($ratingData['scores'])) {
                foreach ($ratingData['scores'] as $score) {
                    if (!$score) {
                        continue;
                    }

                    $insertRating = [
                        'place'   => $newPlaceId,
                        'author'  => null,
                        'session' => null,
                        'value'   => $score,
                    ];

                    $ratingModel->insert($insertRating);
                }
            }

            $inserted[] = $item->item_title;

            echo '<pre>';
            var_dump($place);
            exit();
        }

        return $this->respond($inserted);
    }
}