<?php namespace App\Controllers;

use App\Models\PlacesModel;
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
    public function list()
    {
        $filterCountry  = $this->request->getGet('country', FILTER_SANITIZE_NUMBER_INT);
        $filterProvince = $this->request->getGet('province', FILTER_SANITIZE_NUMBER_INT);
        $filterArea     = $this->request->getGet('area', FILTER_SANITIZE_NUMBER_INT);
        $filterCity     = $this->request->getGet('city', FILTER_SANITIZE_NUMBER_INT);
        $filterAuthor   = $this->request->getGet('author', FILTER_SANITIZE_NUMBER_INT);

        $filterCategory    = $this->request->getGet('category', FILTER_SANITIZE_STRING);
        $filterSubCategory = $this->request->getGet('subcategory', FILTER_SANITIZE_STRING);

        $bounds = $this->request->getGet('bounds', FILTER_SANITIZE_STRING);

        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT);
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT);

        // left (lon), top (lat), right (lon), bottom (lat)
        $bounds = explode(',', $bounds);

        $places = new PlacesModel();
        $items = $places->where([
            'longitude >=' => $bounds[0],
            'latitude >=' => $bounds[1],
            'longitude <=' =>  $bounds[2],
            'latitude <=' =>  $bounds[3],
        ])->findAll();

        return $this->respond([
            'items' => $items,
        ]);
    }

    public function show($id = null): ResponseInterface
    {
        try {
            $places = new PlacesModel();
            $item = $places
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

            if ($item) {
                return $this->respond($item);
            }

            return $this->failNotFound();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}