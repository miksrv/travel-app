<?php namespace App\Controllers;

use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
use App\Models\SessionsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Places extends ResourceController
{
    /**
     * @example http://localhost:8080/places?sort=rating&order=ASC&category=historic&limit=20&offset=1
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $ip = $this->request->getIPAddress();
        $ua = $this->request->getUserAgent();

        $sessionModel = new SessionsModel();
        $findSession  = $sessionModel->where([
            'ip'         => $ip,
            'user_agent' => $ua->getAgentString()
        ])->first();

        $distanceSelect = $findSession
            ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$findSession->latitude} - abs(places.latitude)) * pi()/180 / 2), 2) +  COS({$findSession->latitude} * pi()/180 ) * COS(abs(places.latitude) * pi()/180) *  POWER(SIN(({$findSession->longitude} - places.longitude) * pi()/180 / 2), 2) )) AS distance"
            : '';

        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();
        $placesModel->select(
                'places.id, places.category, places.subcategory, places.latitude, places.longitude,
                places.rating, places.views, translations_places.title, SUBSTRING(translations_places.content, 1, 350) as content,
                category.title as category_title, subcategory.title as subcategory_title' . $distanceSelect)
            ->join('category', 'places.category = category.name', 'left')
            ->join('subcategory', 'places.subcategory = subcategory.name', 'left');

        // Find all places
        $placesList = $this->_makeListFilters($placesModel)->get()->getResult();
        $placesIds  = [];
        $result     = [];
        foreach ($placesList as $place) {
            $placesIds[] = $place->id;
        }

        // Find all photos for all places
        $photosData = $photosModel
            ->havingIn('place', $placesIds)
            ->orderBy('order', 'DESC')
            ->findAll();

        // Map photos and places
        foreach ($placesList as $place) {
            $photoId = array_search($place->id, array_column($photosData, 'place'));
            $counts  = array_count_values(array_column($photosData, 'place'))[$place->id] ?? 0;

            $return  = [
                'id'        => $place->id,
                'latitude'  => (float) $place->latitude,
                'longitude' => (float) $place->longitude,
                'rating'    => (int) $place->rating,
                'views'     => (int) $place->views,
                'title'     => html_entity_decode($place->title),
                'content'   => html_entity_decode($place->content),
                'category'  => [
                    'name'  => $place->category,
                    'title' => $place->category_title,
                ],
                'subcategory' => $place->subcategory ? [
                    'name'  => $place->subcategory,
                    'title' => $place->subcategory_title,
                ] : null,
            ];

            if ($findSession) {
                $return['distance'] = round((float) $place->distance, 1);
            }

            if ($photoId && isset($photosData[$photoId])) {
                $return['photosCount'] = $counts;
                $return['photos']      = [
                    (object) [
                        'filename'  => $photosData[$photoId]->filename,
                        'extension' => $photosData[$photoId]->extension,
                        'width'     => $photosData[$photoId]->width,
                        'height'    => $photosData[$photoId]->width
                    ]
                ];
            }

            $result[] = $return;
        }

        return $this->respond([
            'items'  => $result,
            'count'  => $this->_makeListFilters($placesModel)->countAllResults(),
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        try {
            $ip = $this->request->getIPAddress();
            $ua = $this->request->getUserAgent();

            $sessionModel = new SessionsModel();
            $findSession  = $sessionModel->where([
                'ip'         => $ip,
                'user_agent' => $ua->getAgentString()
            ])->first();

            $distanceSelect = $findSession
                ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$findSession->latitude} - abs(places.latitude)) * pi()/180 / 2), 2) +  COS({$findSession->latitude} * pi()/180 ) * COS(abs(places.latitude) * pi()/180) *  POWER(SIN(({$findSession->longitude} - places.longitude) * pi()/180 / 2), 2) )) AS distance"
                : '';

            $placesTagsModel = new PlacesTagsModel();
            $photosModel = new PhotosModel();
            $placesModel = new PlacesModel();
            $placeData   = $placesModel
                ->select(
                    'places.*, translations_places.title, translations_places.content,
                    users.id as user_id, users.name as user_name, users.level as user_level, 
                    users.reputation as user_reputation, users.avatar as user_avatar,
                    address_country.name as country_name, address_region.name as region_name, 
                    address_district.name as district_name, address_city.name as city_name,
                    category.title as category_title, subcategory.title as subcategory_title' . $distanceSelect
                )
                ->join('users', 'places.author = users.id', 'left')
                ->join('category', 'places.category = category.name', 'left')
                ->join('subcategory', 'places.subcategory = subcategory.name', 'left')
                ->join('translations_places', 'places.id = translations_places.place AND language = "ru"')
                ->join('address_country', 'address_country.id = places.address_country', 'left')
                ->join('address_region', 'address_region.id = places.address_region', 'left')
                ->join('address_district', 'address_district.id = places.address_district', 'left')
                ->join('address_city', 'address_city.id = places.address_city', 'left')
                ->find($id);

            if (!$placeData) {
                return $this->failNotFound();
            }

            // Collect photos
            $placeData->photos = $photosModel
                ->select('photos.author, photos.filename, photos.extension, photos.filesize, photos.width, photos.height, photos.order, translations_photos.title')
                ->join('translations_photos', 'photos.id = translations_photos.photo AND language = "ru"', 'left')
                ->where(['place' => $placeData->id])
                ->findAll();

            // Collect tags
            $placeData->tags = $placesTagsModel
                ->select('tags.id, tags.title, tags.counter')
                ->join('tags', 'tags.id = places_tags.tag')
                ->where(['place' => $placeData->id])
                ->findAll();

            $response = [
                'id'        => $placeData->id,
                'latitude'  => (float) $placeData->latitude,
                'longitude' => (float) $placeData->longitude,
                'rating'    => (int) $placeData->rating,
                'views'     => (int) $placeData->views,
                'title'     => $placeData->title,
                'content'   => $placeData->content,
                'author'    => [
                    'id'         => $placeData->user_id,
                    'name'       => $placeData->user_name,
                    'level'      => (int) $placeData->user_level,
                    'reputation' => (int) $placeData->user_reputation,
                    'avatar'     => $placeData->user_avatar
                ],
                'category'  => [
                    'name'  => $placeData->category,
                    'title' => $placeData->category_title,
                ],
                'subcategory' => $placeData->subcategory ? [
                    'name'  => $placeData->subcategory,
                    'title' => $placeData->subcategory_title,
                ] : null,
                'address'   => [],
                'tags'      => $placeData->tags,
                'photos'    => $placeData->photos
            ];

            if ($placeData->address) {
                $response['address']['street'] = $placeData->address;
            }

            if ($placeData->photos) {
                $response['photosCount'] = count($placeData->photos);
            }

            if ($findSession) {
                $response['distance'] = round((float) $placeData->distance, 1);
            }

            if ($placeData->address_country) {
                $response['address']['country'] = [
                    'id'   => (int) $placeData->address_country,
                    'name' => $placeData->country_name
                ];
            }

            if ($placeData->address_region) {
                $response['address']['region'] = [
                    'id'   => (int) $placeData->address_region,
                    'name' => $placeData->region_name
                ];
            }

            if ($placeData->address_district) {
                $response['address']['district'] = [
                    'id'   => (int) $placeData->address_district,
                    'name' => $placeData->district_name
                ];
            }

            if ($placeData->address_city) {
                $response['address']['city'] = [
                    'id'   => (int) $placeData->address_city,
                    'name' => $placeData->city_name
                ];
            }

            return $this->respond((object) $response);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }

    /**
     * @param PlacesModel $placesModel
     * @return PlacesModel
     */
    protected function _makeListFilters(PlacesModel $placesModel): PlacesModel {
        $orderDefault  = 'DESC';
        $sortingFields = ['views', 'rating', 'title', 'category', 'subcategory', 'distance', 'created_at', 'updated_at'];
        $orderFields   = ['ASC', 'DESC'];

        $sort     = $this->request->getGet('sort', FILTER_SANITIZE_STRING);
        $order    = $this->request->getGet('order', FILTER_SANITIZE_STRING) ?? $orderDefault;
        $search   = $this->request->getGet('search', FILTER_SANITIZE_STRING);
        $country  = $this->request->getGet('country', FILTER_SANITIZE_NUMBER_INT);
        $region   = $this->request->getGet('region', FILTER_SANITIZE_NUMBER_INT);
        $district = $this->request->getGet('district', FILTER_SANITIZE_NUMBER_INT);
        $city     = $this->request->getGet('city', FILTER_SANITIZE_NUMBER_INT);
        $limit    = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 20;
        $offset   = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $category    = $this->request->getGet('category', FILTER_SANITIZE_STRING);
        $subcategory = $this->request->getGet('subcategory', FILTER_SANITIZE_STRING);

        if ($search) {
            $search = " AND (translations_places.title LIKE '%{$search}%' OR translations_places.content LIKE '%{$search}%')";
        }

        $placesModel->join('translations_places', 'places.id = translations_places.place AND language = "ru"' . $search);

        if ($country) {
            $placesModel->where(['address_country' => $country]);
        }

        if ($region) {
            $placesModel->where(['address_region' => $region]);
        }

        if ($district) {
            $placesModel->where(['address_district' => $district]);
        }

        if ($city) {
            $placesModel->where(['address_city' => $city]);
        }

        if ($category) {
            $placesModel->where(['places.category' => $category]);
        }

        if ($subcategory) {
            $placesModel->where(['places.subcategory' => $subcategory]);
        }

        if (in_array($sort, $sortingFields)) {
            $placesModel->orderBy($sort, in_array($order, $orderFields) ? $order : $orderDefault);
        }

        return $placesModel->limit($limit <= 0 || $limit > 20 ? 20 : $limit, $offset);
    }
}