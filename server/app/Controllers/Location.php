<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Libraries\LocaleLibrary;
use App\Libraries\Session;
use App\Models\LocationCitiesModel;
use App\Models\LocationCountriesModel;
use App\Models\LocationDistrictsModel;
use App\Models\LocationRegionsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Geocoder\Exception\Exception;
use ReflectionException;

class Location extends ResourceController {
    /**
     * @throws Exception|ReflectionException
     */
    public function geocoder(): ResponseInterface {
        $localeLibrary = new LocaleLibrary();

        $lat = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lng = $this->request->getGet('lng', FILTER_VALIDATE_FLOAT);

        $session = new Session();
        $locale  = $localeLibrary->locale;

        if (!$session->isAuth) {
            return $this->failUnauthorized();
        }

        $geocoder = new Geocoder($lat, $lng);

        return $this->respond((object) [
            'address' => $locale === 'ru' ? $geocoder->addressRu : $geocoder->addressEn
        ]);
    }

    /**
     * @param $id
     * @example http://localhost:8080/location/1?type=district
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        $location = ['country', 'region', 'district', 'city'];
        $type     = $this->request->getGet('type', FILTER_SANITIZE_SPECIAL_CHARS);

        if (!in_array($type, $location)) {
            return $this->failValidationErrors('Location type must be one of types: ' . implode(', ', $location));
        }

        if ($type === 'country') {
            $countriesModel = new LocationCountriesModel();
            return $this->_showResult($countriesModel->find($id));
        }

        if ($type === 'region') {
            $regionsModel  = new LocationRegionsModel();
            return $this->_showResult($regionsModel->find($id));
        }

        if ($type === 'district') {
            $districtsModel = new LocationDistrictsModel();
            return $this->_showResult($districtsModel->find($id));
        }

        if ($type === 'city') {
            $citiesModel = new LocationCitiesModel();
            return $this->_showResult($citiesModel->find($id));
        }

        return $this->failValidationErrors('Unknown location type');
    }

    /**
     * @param object $data
     * @return ResponseInterface
     */
    private function _showResult(object $data): ResponseInterface {
        $localeLibrary = new LocaleLibrary();

        $locale = $localeLibrary->locale;
        $result = $data;

        $result->title = $result->{"title_$locale"};
        unset($result->title_en, $result->title_ru);

        return $this->respond($result);
    }
}