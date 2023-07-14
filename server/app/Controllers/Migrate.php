<?php namespace App\Controllers;
;
use App\Libraries\Geocoder;
use App\Models\MigrateMediaModel;
use App\Models\MigratePlacesModel;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
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


        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();

        $migratePlaces = new MigratePlacesModel();
        $migrateMedia  = new MigrateMediaModel();

        $migratePlace = $migratePlaces->findAll();

        foreach ($migratePlace as $item) {
            if ($placesModel->where('title', $item->item_title)->withDeleted()->first()) {
                continue;
            }

            $geocoder = new Geocoder($item->item_latitude, $item->item_longitude);
            $place    = new \App\Entities\Place();

            $place->latitude         = $item->item_latitude;
            $place->longitude        = $item->item_longitude;
            $place->author           = '';
            $place->rating           = '';
            $place->views            = $item->item_count_views;
            $place->category         = '';
            $place->subcategory      = '';
            $place->title            = $item->item_title;
            $place->content          = $item->item_content;
            $place->tags             = (object) ['hashcodes' => explode(',', $item->item_tags)];
            $place->address          = $geocoder->address;
            $place->address_country  = $geocoder->countryID;
            $place->address_region   = $geocoder->regionID;
            $place->address_district = $geocoder->districtID;
            $place->address_city     = $geocoder->cityID;

            echo '<pre>';
            var_dump($place);
            var_dump(unserialize($item->item_rating));
            exit();
        }

        $item = [];

        return $this->respond($item);
    }
}