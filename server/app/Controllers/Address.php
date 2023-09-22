<?php namespace App\Controllers;

use App\Models\AddressCity;
use App\Models\AddressCountry;
use App\Models\AddressDistrict;
use App\Models\AddressRegion;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Address extends ResourceController
{
    /**
     * @return ResponseInterface
     */
    public function search(): ResponseInterface {
        $search = $this->request->getGet('search', FILTER_SANITIZE_STRING);

        $countriesModel = new AddressCountry();
        $regionsModel   = new AddressRegion();
        $districtsModel = new AddressDistrict();
        $citiesModel    = new AddressCity();

        $countriesData = $countriesModel->like('name', $search)->findAll();
        $regionsData   = $regionsModel->like('name', $search)->findAll();
        $districtsData = $districtsModel->like('name', $search)->findAll();
        $citiesData    = $citiesModel->like('name', $search)->findAll();

        $response = [];

        if ($countriesData) {
            $response['countries'] = $countriesData;
        }

        if ($regionsData) {
            $response['regions'] = $regionsData;
        }

        if ($districtsData) {
            $response['districts'] = $districtsData;
        }

        if ($citiesData) {
            $response['cities'] = $citiesData;
        }

        return $this->respond($response);
    }
}