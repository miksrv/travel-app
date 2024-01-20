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
    protected string $locale = 'ru';

    function __construct() {
        $localeLibrary = new LocaleLibrary();
        $this->locale  = $localeLibrary->locale;
    }

    /**
     * @throws Exception|ReflectionException
     */
    public function geocoder(): ResponseInterface {
        $lat = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lng = $this->request->getGet('lng', FILTER_VALIDATE_FLOAT);

        $session = new Session();

        if (!$session->isAuth) {
            return $this->failUnauthorized();
        }

        $geocoder = new Geocoder($lat, $lng);

        return $this->respond((object) [
            'address' => $this->locale === 'ru' ? $geocoder->addressRu : $geocoder->addressEn
        ]);
    }

    public function search(): ResponseInterface {
        $result = [];
        $text   = $this->request->getGet('text', FILTER_SANITIZE_STRING);

        if (!$text) {
            return $this->failValidationErrors('Please enter search string');
        }

        $countriesData = $this->_searchResult(new LocationCountriesModel(), $text);
        $regionsData   = $this->_searchResult(new LocationRegionsModel(), $text);
        $districtsData = $this->_searchResult(new LocationDistrictsModel(), $text);
        $citiesData    = $this->_searchResult(new LocationCitiesModel(), $text);

        $result['countries'] = $this->_prepareSearchData($countriesData);
        $result['regions']   = $this->_prepareSearchData($regionsData);
        $result['districts'] = $this->_prepareSearchData($districtsData);
        $result['cities']    = $this->_prepareSearchData($citiesData);

        return $this->respond($result);
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
        $result = $data;

        $result->title = $result->{"title_$this->locale"};
        unset($result->title_en, $result->title_ru);

        return $this->respond($result);
    }

    /**
     * @param $locationModel
     * @param $text
     * @return mixed
     */
    private function _searchResult($locationModel, string $text): mixed {
        return $locationModel->like('title_en', $text)->orLike('title_ru', $text)->findAll();
    }

    private function _prepareSearchData(array $data): array {
        $result = [];

        if ($data) {
            foreach ($data as $item) {
                $item->title = $item->{"title_{$this->locale}"};
                unset($item->title_en, $item->title_ru);

                $result[] = $item;
            }
        }

        return $result;
    }
}