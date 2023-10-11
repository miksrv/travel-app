<?php namespace App\Controllers;

use App\Libraries\PlaceTranslation;
use App\Libraries\Session;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
use App\Models\RatingModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Places extends ResourceController
{
    /**
     * @example http://localhost:8080/places?sort=rating&order=ASC&category=historic&limit=20&offset=1
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $lat    = $this->request->getGet('latitude', FILTER_VALIDATE_FLOAT);
        $lon    = $this->request->getGet('longitude', FILTER_VALIDATE_FLOAT);
        $search = $this->request->getGet('search', FILTER_SANITIZE_STRING);

        $session = new Session();

        // Load translate library
        $placeTranslations = new PlaceTranslation('ru', 350);

        // When searching, we search by criteria in the translation array to return object IDs
        if ($search) {
            $placeTranslations->search($search);

            // At the same time, if we did not find anything based on the search conditions,
            // we immediately return an empty array and do not execute the code further
            if (empty($placeTranslations->placeIds)) {
                return $this->respond([
                    'items'  => [],
                    'count'  => 0,
                ]);
            }
        }

        if ($lat && $lon) {
            $distanceSelect = ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$lat} - abs(places.latitude)) * pi()/180 / 2), 2) +  COS({$lat} * pi()/180 ) * COS(abs(places.latitude) * pi()/180) *  POWER(SIN(({$lon} - places.longitude) * pi()/180 / 2), 2) )) AS distance";
        } else {
            $distanceSelect = ($session->longitude && $session->latitude)
                ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$session->latitude} - abs(places.latitude)) * pi()/180 / 2), 2) +  COS({$session->latitude} * pi()/180 ) * COS(abs(places.latitude) * pi()/180) *  POWER(SIN(({$session->longitude} - places.longitude) * pi()/180 / 2), 2) )) AS distance"
                : '';
        }

        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();
        $placesModel
            ->select('places.id, places.category, places.latitude, places.longitude, places.rating, places.views, category.title as category_title' . $distanceSelect)
            ->join('category', 'places.category = category.name', 'left');

        // Find all places
        // If a search was enabled, the second argument to the _makeListFilters function will contain the
        // IDs of the places found using the search criteria
        $placesList = $this->_makeListFilters($placesModel, $placeTranslations->placeIds)->get()->getResult();
        $placesIds  = [];
        $result     = [];
        foreach ($placesList as $place) {
            $placesIds[] = $place->id;
        }

        // Find all photos for all places
        $photosData = $placesIds
            ? $photosModel
                ->havingIn('place', $placesIds)
                ->orderBy('order', 'DESC')
                ->findAll()
            : $placesIds;

        // We find translations for all objects if no search was used.
        // When searching, we already know translations for all found objects
        if (!$search) {
            $placeTranslations->translate($placesIds);
        }

        // Map photos and places
        foreach ($placesList as $place) {
            $photoId = array_search($place->id, array_column($photosData, 'place'));
            $counts  = array_count_values(array_column($photosData, 'place'))[$place->id] ?? 0;

            $return  = [
                'id'        => $place->id,
                'latitude'  => (float) $place->latitude,
                'longitude' => (float) $place->longitude,
                'rating'    => (float) $place->rating,
                'views'     => (int) $place->views,
                'title'     => $placeTranslations->title($place->id),
                'content'   => $placeTranslations->content($place->id),
                'category'  => [
                    'name'  => $place->category,
                    'title' => $place->category_title,
                ]
            ];

            if ($distanceSelect) {
                $return['distance'] = round((float) $place->distance, 1);
            }

            if ($photoId !== false && isset($photosData[$photoId])) {
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
            'count'  => $this->_makeListFilters($placesModel, !$search ? [] : $placeTranslations->placeIds)->countAllResults(),
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function show($id = null): ResponseInterface {
        $session = new Session();

        // Load translate library
        $placeTranslate = new PlaceTranslation('ru');
        $placeTranslate->translate([$id]);

        try {
            $distanceSelect = ($session->longitude && $session->latitude)
                ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$session->latitude} - abs(places.latitude)) * pi()/180 / 2), 2) +  COS({$session->latitude} * pi()/180 ) * COS(abs(places.latitude) * pi()/180) *  POWER(SIN(({$session->longitude} - places.longitude) * pi()/180 / 2), 2) )) AS distance"
                : '';

            $placesTagsModel = new PlacesTagsModel();
            $photosModel = new PhotosModel();
            $placesModel = new PlacesModel();
            $placeData   = $placesModel
                ->select(
                    'places.*,  users.id as user_id, users.name as user_name, users.avatar as user_avatar,
                    address_country.name as country_name, address_region.name as region_name, 
                    address_district.name as district_name, address_city.name as city_name,
                    category.title as category_title' . $distanceSelect)
                ->join('users', 'places.author = users.id', 'left')
                ->join('category', 'places.category = category.name', 'left')
                ->join('address_country', 'address_country.id = places.address_country', 'left')
                ->join('address_region', 'address_region.id = places.address_region', 'left')
                ->join('address_district', 'address_district.id = places.address_district', 'left')
                ->join('address_city', 'address_city.id = places.address_city', 'left')
                ->find($id);

            if (!$placeData) { //  || !$placeTranslate->title($id)
                return $this->failNotFound();
            }

            // Collect photos
            $placeData->photos = $photosModel
                ->select(
                    'photos.author, photos.filename, photos.extension, photos.filesize, photos.width, 
                    photos.height, photos.order, translations_photos.title, photos.created_at,
                    users.id as user_id, users.name as user_name, users.avatar as user_avatar')
                ->join('users', 'photos.author = users.id', 'left')
                ->join('translations_photos', 'photos.id = translations_photos.photo AND language = "ru"', 'left')
                ->where(['place' => $placeData->id])
                ->findAll();

            // Collect tags
            $placeData->tags = $placesTagsModel
                ->select('tags.id, tags.title, tags.counter')
                ->join('tags', 'tags.id = places_tags.tag')
                ->where(['place' => $placeData->id])
                ->findAll();

            // Has the user already voted for this material or not?
            $ratingModel = new RatingModel();
            $ratingData  = $ratingModel
                ->select('rating.id')
                ->where(['place' => $placeData->id, 'session' => $session->id])
                ->first();

            $response = [
                'id'        => $placeData->id,
                'created'   => $placeData->created_at ?? null,
                'updated'   => $placeData->updated_at ?? null,
                'latitude'  => (float) $placeData->latitude,
                'longitude' => (float) $placeData->longitude,
                'rating'    => (float) $placeData->rating,
                'views'     => (int) $placeData->views,
                'title'     => $placeTranslate->title($id),
                'content'   => $placeTranslate->content($id),
                'author'    => [
                    'id'     => $placeData->user_id,
                    'name'   => $placeData->user_name,
                    'avatar' => $placeData->user_avatar
                ],
                'category'  => [
                    'name'  => $placeData->category,
                    'title' => $placeData->category_title,
                ],
                'actions'   => [
                    'rating' => !$ratingData
                ],
                'address'   => [],
                'tags'      => $placeData->tags,
            ];

            if ($placeData->address) {
                $response['address']['street'] = $placeData->address;
            }

            if ($placeData->photos) {
                $response['photos']      = [];
                $response['photosCount'] = count($placeData->photos);

                foreach ($placeData->photos as $photo) {
                    $response['photos'][] = [
                        'filename'  => $photo->filename,
                        'extension' => $photo->extension,
                        'filesize'  => $photo->filesize,
                        'order'     => $photo->order,
                        'width'     => $photo->width,
                        'height'    => $photo->height,
                        'title'     => $photo->title,
                        'created'   => $photo->created_at,
                        'author'    => $photo->user_id ? [
                            'id'     => $photo->user_id,
                            'name'   => $photo->user_name,
                            'avatar' => $photo->user_avatar,
                        ] : null
                    ];
                }
            }

            if ($session->longitude && $session->latitude) {
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

            // Update view counts
            $placesModel->update($placeData->id, [
                'views'      => $placeData->views + 1,
                'updated_at' => $placeData->updated_at
            ]);

            return $this->respond((object) $response);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }

    /**
     * @param PlacesModel $placesModel
     * @param array $placeIds
     * @return PlacesModel
     */
    protected function _makeListFilters(PlacesModel $placesModel, array $placeIds = []): PlacesModel {
        $orderDefault  = 'DESC';
        $sortingFields = ['views', 'rating', 'title', 'category', 'distance', 'created_at', 'updated_at'];
        $orderFields   = ['ASC', 'DESC'];

        $sort     = $this->request->getGet('sort', FILTER_SANITIZE_STRING);
        $exclude  = $this->request->getGet('excludePlaces', FILTER_SANITIZE_STRING);
        $order    = $this->request->getGet('order', FILTER_SANITIZE_STRING) ?? $orderDefault;
        $country  = $this->request->getGet('country', FILTER_SANITIZE_NUMBER_INT);
        $region   = $this->request->getGet('region', FILTER_SANITIZE_NUMBER_INT);
        $district = $this->request->getGet('district', FILTER_SANITIZE_NUMBER_INT);
        $city     = $this->request->getGet('city', FILTER_SANITIZE_NUMBER_INT);
        $limit    = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 20;
        $offset   = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;
        $category = $this->request->getGet('category', FILTER_SANITIZE_STRING);

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

        if ($exclude) {
            $exclude = explode(',', $exclude);
            $placesModel->whereNotIn('places.id', $exclude);
        }

        if ($placeIds && count($placeIds) >= 1) {
            $placesModel->whereIn('places.id', $placeIds);
        }

        if (in_array($sort, $sortingFields)) {
            $sort = $sort === 'updated_at' ? 'places.updated_at' : $sort;

            $placesModel->orderBy($sort, in_array($order, $orderFields) ? $order : $orderDefault);
        }

        return $placesModel->limit($limit <= 0 || $limit > 20 ? 20 : $limit, $offset);
    }
}