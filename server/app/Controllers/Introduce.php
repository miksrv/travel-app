<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Libraries\OverpassAPI;
use App\Libraries\Session;
use App\Models\CategoryModel;
use App\Models\OverpassCategoryModel;
use App\Models\PlacesModel;
use App\Models\TranslationsPlacesModel;
use App\Models\UsersActivityModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Geocoder\Exception\Exception;
use ReflectionException;

ignore_user_abort(true);

class Introduce extends ResourceController
{
    /**
     * Пользователь представляется сервису, отправляя свои координаты.
     * По координатам выполняется поиск новых мест в округе, сессия пользователя сохраняется в БД.
     * @return void
     * @throws ReflectionException
     * @throws Exception
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
            // Если такой overpass_id уже есть в БД, пропускаем
            if ($placesModel->where('overpass_id', $point->id)->withDeleted()->first()) {
                continue;
            }

            // Если вообще нет никакого названия - пропускаем просто
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

            // Если нет категории для маппинга, то пропускаем такой не известный тип POI
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

    protected function cleanTags(array $tags, string $category): ?string {
        if (!$tags) {
            return null;
        }

        unset($tags[$category]);
        unset($tags['name']);

        return json_encode($tags);
    }
}