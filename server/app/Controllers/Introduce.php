<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Libraries\OverpassAPI;
use App\Libraries\Session;
use App\Models\OverpassCategoryModel;
use App\Models\PlacesModel;
use App\Models\TranslationsPlacesModel;
use App\Models\UsersActivityModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Geocoder\Exception\Exception;
use ReflectionException;

ignore_user_abort(true);

class Introduce extends ResourceController {
    /**
     * The user introduces himself to the service by sending his coordinates.
     * The coordinates are used to search for new places in the area, and the user session is saved in the database.
     * @return ResponseInterface
     * @throws Exception
     * @throws ReflectionException
     */
    public function hello(): ResponseInterface {
        $lat = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lon = $this->request->getGet('lon', FILTER_VALIDATE_FLOAT);

        new Session($lat, $lon);

        $pointAdded = [];

        if ($lat && $lon) {
            $pointAdded = $this->_updatePlaces($lat, $lon);
        }

        return $this->respond(['items' => $pointAdded]);
    }

    /**
     * @throws Exception
     * @throws ReflectionException
     */
    protected function _updatePlaces(float $lat, float $lon): array {
        $overpassAPI = new OverpassAPI();
        $boundingBox = $overpassAPI->getBoundingBox($lat, $lon, .5);
        $pointsList  = $overpassAPI->get($boundingBox);
        $pointAdded  = [];

        if (!$pointsList) {
            return $pointAdded;
        }

        $placesModel      = new PlacesModel();
        $activityModel    = new UsersActivityModel();
        $overpassCatModel = new OverpassCategoryModel();

        foreach ($pointsList as $point) {
            // If such an overpass_id is already in the database, skip it
            if ($placesModel->where('overpass_id', $point->id)->withDeleted()->first()) {
                continue;
            }

            // If there is no name at all, we simply skip it
            if (!isset($point->tags['name:en']) && !isset($point->tags['name:ru']) && !isset($point->tags['name'])) {
                continue;
            }

            $findOverpassCat = $overpassCatModel->where('name', $point->tags[$point->category])->first();
            $newPoiName      = $point->tags['name:en'] ?? $point->tags['name:ru'] ?? $point->tags['name'];

            if (!$findOverpassCat) {
                $overpassCatModel->insert([
                    'name'        => $point->tags[$point->category],
                    'category'    => $point->category,
                    'subcategory' => null,
                    'title'       => ''
                ]);
            }

            // If there is no category for mapping, then we skip this unknown type of POI
            if (!$findOverpassCat->category_map || !$newPoiName) {
                continue;
            }

            $geocoder = new Geocoder($point->lat, $point->lon);

            $place = new \App\Entities\Place();

            $place->overpass_id = $point->id;
            $place->category    = $findOverpassCat->category_map;
            $place->latitude    = $point->lat;
            $place->longitude   = $point->lon;
            $place->address          = $geocoder->address;
            $place->address_country  = $geocoder->countryID;
            $place->address_region   = $geocoder->regionID;
            $place->address_district = $geocoder->districtID;
            $place->address_city     = $geocoder->cityID;
            $place->tags             = $this->cleanTags($point->tags, $point->category);
            $placesModel->insert($place);

            $newPlaceId = $placesModel->getInsertID();

            $translationsPlacesModel = new TranslationsPlacesModel();
            $translation = new \App\Entities\TranslationPlace();
            $translation->place      = $newPlaceId;
            $translation->language   = 'ru';
            $translation->title      = $newPoiName;
            $translation->content    = '';
            $translationsPlacesModel->insert($translation);

            // Make user activity
            $activity = new \App\Entities\UserActivity();
            $activity->type       = 'place';
            $activity->place      = $newPlaceId;
            $activityModel->insert($activity);

            $pointAdded[] = $newPoiName;
        }

        return $pointAdded;
    }

    /**
     * Remove unused tags (name and category) from OverpassAPI
     * @param array $tags
     * @param string $category
     * @return string|null
     */
    protected function cleanTags(array $tags, string $category): ?string {
        if (!$tags) {
            return null;
        }

        unset($tags[$category]);
        unset($tags['name']);

        return json_encode($tags);
    }
}