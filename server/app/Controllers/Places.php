<?php namespace App\Controllers;

use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
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
//    public function list()
//    {
//        $filterCountry  = $this->request->getGet('country', FILTER_SANITIZE_NUMBER_INT);
//        $filterProvince = $this->request->getGet('province', FILTER_SANITIZE_NUMBER_INT);
//        $filterArea     = $this->request->getGet('area', FILTER_SANITIZE_NUMBER_INT);
//        $filterCity     = $this->request->getGet('city', FILTER_SANITIZE_NUMBER_INT);
//        $filterAuthor   = $this->request->getGet('author', FILTER_SANITIZE_NUMBER_INT);
//
//        $filterCategory    = $this->request->getGet('category', FILTER_SANITIZE_STRING);
//        $filterSubCategory = $this->request->getGet('subcategory', FILTER_SANITIZE_STRING);
//
//        $bounds = $this->request->getGet('bounds', FILTER_SANITIZE_STRING);
//
//        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT);
//        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT);
//
//        // left (lon), top (lat), right (lon), bottom (lat)
//        $bounds = explode(',', $bounds);
//
//        $places = new PlacesModel();
//        $items = $places->where([
//            'longitude >=' => $bounds[0],
//            'latitude >=' => $bounds[1],
//            'longitude <=' =>  $bounds[2],
//            'latitude <=' =>  $bounds[3],
//        ])->findAll();
//
//        return $this->respond([
//            'items' => $items,
//        ]);
//    }

    /**
     * @example http://localhost:8080/places?sort=rating&order=ASC&category=historic&limit=20&offset=1
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();
        $placesModel->select(
                'places.id, places.category, places.subcategory, places.latitude, places.longitude,
                places.rating, places.views, translations_places.title, translations_places.content,
                category.title as category_title, subcategory.title as subcategory_title')
            ->join('category', 'places.category = category.name')
            ->join('subcategory', 'places.subcategory = subcategory.name');

        // Find all places
        $placesList = $this->_make_list_filters($placesModel)->get()->getResult();
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
            $return  = [];

            if (isset($photosData[$photoId])) {
                $return['photo'] = (object) [
                    'filename'  => $photosData[$photoId]->filename,
                    'extension' => $photosData[$photoId]->extension,
                    'width'     => $photosData[$photoId]->width,
                    'height'    => $photosData[$photoId]->width,
                ];
            }
        }

        return $this->respond([
            'items'  => $placesList,
            'count'  => $this->_make_list_filters($placesModel)->countAllResults(),
        ]);
    }

    protected function _make_list_filters(PlacesModel $placesModel): PlacesModel {
        $orderDefault  = 'DESC';
        $sortingFields = ['views', 'rating', 'created', 'updated', 'title', 'category', 'subcategory', 'created_at', 'updated_at'];
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

    public function show($id = null): ResponseInterface {
        try {
            $placesTagsModel = new PlacesTagsModel();
            $photosModel = new PhotosModel();
            $placesModel = new PlacesModel();
            $placeData   = $placesModel
                ->select(
                    'places.*, ' .
                    'address_country.name as country_name, ' .
                    'address_region.name as region_name, ' .
                    'address_district.name as district_name, ' .
                    'address_city.name as city_name'
                )
                ->join('address_country', 'address_country.id = places.address_country')
                ->join('address_region', 'address_region.id = places.address_region')
                ->join('address_district', 'address_district.id = places.address_district')
                ->join('address_city', 'address_city.id = places.address_city')
                ->find($id);

            if (!$placeData) {
                return $this->failNotFound();
            }

            // Collect photos
            $placeData->photos = $photosModel
                ->select('photos.id, photos.author, photos.filename, photos.extension, photos.filesize, photos.width, photos.height, photos.order, translations_photos.title')
                ->join('translations_photos', 'photos.id = translations_photos.photo AND language = "ru"')
                ->where(['place' => $placeData->id])
                ->findAll();

            // Collect tags
            $placeData->tags = $placesTagsModel
                ->select('tags.id, tags.title, tags.counter')
                ->join('tags', 'tags.id = places_tags.tag')
                ->where(['place' => $placeData->id])
                ->findAll();

            return $this->respond($placeData);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}