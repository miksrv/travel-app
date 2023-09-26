<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Libraries\OverpassAPI;
use App\Models\AddressCity;
use App\Models\AddressCountry;
use App\Models\AddressDistrict;
use App\Models\AddressRegion;
use App\Models\CategoryModel;
use App\Models\OverpassCategoryModel;
use App\Models\PlacesModel;
use App\Models\SessionsHistoryModel;
use App\Models\SessionsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Geocoder\Exception\Exception;
use ReflectionException;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

ignore_user_abort(true);

class Introduce extends ResourceController
{

    /**
     * Пользователь представляется сервису, отправляя свои координаты.
     * По координатам выполняется поиск новых мест в округе, сессия пользователя сохраняется в БД.
     * @return void
     * @throws ReflectionException
     */
    public function hello(): ResponseInterface {
        $lat = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lon = $this->request->getGet('lon', FILTER_VALIDATE_FLOAT);

        $ip = $this->request->getIPAddress();
        $ua = $this->request->getUserAgent();

        $pointAdded = [];

        if ($lat && $lon) {
            $pointAdded = $this->_updatePlaces($lat, $lon);
        }

        $sessionModel = new SessionsModel();
        $findSession  = $sessionModel->where([
            'ip'         => $ip,
            'user_agent' => $ua->getAgentString()
        ])->first();

        // Если сессия пользователя (на осное его IP и UserAgent новая) - она сохраняется в двух таблицах
        if (empty($findSession)) {
            $newSession = [
                'id'         => md5($ip . $ua->getAgentString()),
                'ip'         => $ip,
                'user_agent' => $ua->getAgentString(),
                'latitude'   => $lat,
                'longitude'  => $lon
            ];

            $sessionModel->insert($newSession);

            $sessionHistoryModel = new SessionsHistoryModel();
            $sessionHistoryModel->insert([
                'id' => uniqid(),
                'session' => $newSession['id'],
                'latitude'   => $lat,
                'longitude'  => $lon
            ]);
        } else {
            // Если сессия уже есть в БД и положение сейчас отличается от того, что было сохранено,
            // То создается новая запись в истории сессий
            if ($lat !== $findSession->latitude || $lon !== $findSession->longitude) {
                $sessionHistoryModel = new SessionsHistoryModel();
                $sessionHistoryModel->insert([
                    'id'        => uniqid(),
                    'session'   => $findSession->id,
                    'latitude'  => $lat,
                    'longitude' => $lon
                ]);
            }

            // В любом случае обновляем текущую сессию
            $sessionModel->update($findSession->id, ['latitude' => $lat, 'longitude' => $lon]);
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
        $categoryModel    = new CategoryModel();
        $overpassCatModel = new OverpassCategoryModel();

        foreach ($pointsList as $point) {
            if ($placesModel->where('overpass_id', $point->id)->withDeleted()->first()) {
                continue;
            }

            $findCategory = $categoryModel->where('name', $point->category)->first();

            if (!$findCategory) {
                $categoryModel->insert(['name' => $point->category]);
            }

            $findOverpassCat = $overpassCatModel->where('name', $point->tags[$point->category])->first();

            if (!$findOverpassCat) {
                $overpassCatModel->insert([
                    'name'        => $point->tags[$point->category],
                    'category'    => $findCategory ? $findCategory->name : $point->category,
                    'subcategory' => null,
                    'title'       => ''
                ]);
            }

            $geocoder = new Geocoder($point->lat, $point->lon);

            $place = new \App\Entities\Place();

            $place->overpass_id = $point->id;
            $place->category    = $findCategory->name ?? $point->category;
//            $place->subcategory = $findOverpassCat->subcategory ?? null;
            $place->latitude    = $point->lat;
            $place->longitude   = $point->lon;
            $place->title       = $point->tags['name'] ?? null;
            $place->content     = '';

            $place->address          = $geocoder->address;
            $place->address_country  = $geocoder->countryID;
            $place->address_region   = $geocoder->regionID;
            $place->address_district = $geocoder->districtID;
            $place->address_city     = $geocoder->cityID;
            $place->tags             = $this->cleanTags($point->tags, $point->category);

            $pointAdded[] = $place->title;

            if ($placesModel->insert($place) === false) {
                echo '<pre>';
                var_dump($placesModel->errors());
                exit();
            }
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