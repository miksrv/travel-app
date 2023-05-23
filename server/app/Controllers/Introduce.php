<?php namespace App\Controllers;

use App\Libraries\OverpassAPI;
use App\Models\CategoryModel;
use App\Models\PlacesModel;
use App\Models\SessionsHistoryModel;
use App\Models\SessionsModel;
use App\Models\SubcategoryModel;
use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Introduce extends ResourceController
{
    public function hello()
    {
        $lat = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lon = $this->request->getGet('lon', FILTER_VALIDATE_FLOAT);

        $ip = $this->request->getIPAddress();
        $ua = $this->request->getUserAgent();

        if ($lat && $lon)
        {
            $this->_updatePlaces($lat, $lon);
        }

        $sessionModel = new SessionsModel();
        $findSession  = $sessionModel->where([
            'ip'         => $ip,
            'user_agent' => $ua->getAgentString()
        ])->first();

        if (empty($findSession))
        {
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
        }
        else
        {
            if ($lat !== $findSession->latitude || $lon !== $findSession->longitude)
            {
                $sessionHistoryModel = new SessionsHistoryModel();
                $sessionHistoryModel->insert([
                    'id'        => uniqid(),
                    'session'   => $findSession->id,
                    'latitude'  => $lat,
                    'longitude' => $lon
                ]);
            }

            $sessionModel->update($findSession->id, ['latitude' => $lat, 'longitude' => $lon]);
        }
    }

    protected function _updatePlaces(float $lat, float $lon)
    {
        $overpassAPI = new OverpassAPI();
        $boundingBox = $overpassAPI->getBoundingBox($lat, $lon, .5);
        $pointsList  = $overpassAPI->get($boundingBox);

        if (!$pointsList) return ;

        $placesModel      = new PlacesModel();
        $categoryModel    = new CategoryModel();
        $subcategoryModel = new SubcategoryModel();

        foreach ($pointsList as $point) {
            if ($placesModel->where('overpass_id', $point->id)->withDeleted()->first())
            {
                continue;
            }

            $findCategory = $categoryModel->where('name', $point->category)->first();

            if (!$findCategory) {
                $categoryModel->insert(['name' => $point->category]);
                $categoryId = $categoryModel->getInsertID();
            }

            $findSubcategory = $subcategoryModel->where('name', $point->tags[$point->category])->first();

            if (!$findSubcategory) {
                $subcategoryModel->insert([
                    'name'     => $point->tags[$point->category],
                    'category' => $findCategory ? $findCategory->id : $categoryId
                ]);
                $subcategoryId = $subcategoryModel->getInsertID();
            }

            $place = new \App\Entities\Place();

            $place->overpass_id = $point->id;
            $place->category    = $findCategory->id ?? $categoryId;
            $place->subcategory = $findSubcategory->id ?? $subcategoryId;
            $place->latitude    = $point->lat;
            $place->longitude   = $point->lon;
            $place->title       = $point->tags['name'] ?? 'Не известно';
//            $place->tags        = $this->_cleanTags($point->tags, $point->category);

            if ($placesModel->insert($place) === false) {
                echo '<pre>';
                var_dump($placesModel->errors());
                exit();
            }
        }
    }

    protected function _cleanTags(array $tags, string $category): object {
        unset($tags[$category]);
        unset($tags['name']);

        return (object) $tags;
    }
}