<?php namespace App\Controllers;

use App\Models\LocationCitiesModel;
use App\Models\LocationCountriesModel;
use App\Models\LocationDistrictsModel;
use App\Models\LocationRegionsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

/**
 * Addresses API controller
 *
 * GET /search?search=text
 */
class Address extends ResourceController {
    /**
     * Find all address by search text
     * @return ResponseInterface
     */
    public function search(): ResponseInterface {
        $search = $this->request->getGet('search', FILTER_SANITIZE_STRING);

        $countriesModel = new LocationCountriesModel();
        $regionsModel   = new LocationRegionsModel();
        $districtsModel = new LocationDistrictsModel();
        $citiesModel    = new LocationCitiesModel();

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