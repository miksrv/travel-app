<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Libraries\Session;
use App\Models\AddressCity;
use App\Models\AddressCountry;
use App\Models\AddressDistrict;
use App\Models\AddressRegion;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Geocoder\Exception\Exception;

class Location extends ResourceController {
    /**
     * @throws Exception
     */
    public function geocoder(): ResponseInterface {
        $lat = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lng = $this->request->getGet('lng', FILTER_VALIDATE_FLOAT);

        $session = new Session();

        if (!$session->isAuth) {
            return $this->failUnauthorized();
        }

        $geocoder = new Geocoder($lat, $lng);

        return $this->respond((object) ['address' => $geocoder->address]);
    }

    public function show($id = null): ResponseInterface {
        $location = ['country', 'region', 'district', 'city'];
        $type = $this->request->getGet('type', FILTER_SANITIZE_SPECIAL_CHARS);

        if (!in_array($type, $location)) {
            return $this->failValidationErrors('Location type must be one of types: ' . implode(', ', $location));
        }

        if ($type === 'country') {
            $countriesModel = new AddressCountry();
            $countriesData  = $countriesModel->find($id);
            return $this->respond((object) $countriesData);
        }

        if ($type === 'region') {
            $regionsModel = new AddressRegion();
            $regionsData  = $regionsModel->find($id);
            return $this->respond((object) $regionsData);
        }

        if ($type === 'district') {
            $districtsModel = new AddressDistrict();
            $districtsData  = $districtsModel->find($id);
            return $this->respond((object) $districtsData);
        }

        if ($type === 'city') {
            $citiesModel = new AddressCity();
            $citiesData  = $citiesModel->find($id);
            return $this->respond((object) $citiesData);
        }

        return $this->failValidationErrors('Unknown location type');
    }
}