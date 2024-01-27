<?php namespace App\Libraries;

use App\Models\LocationCitiesModel;
use App\Models\LocationCountriesModel;
use App\Models\LocationDistrictsModel;
use App\Models\LocationRegionsModel;
use Config\Services;
use Geocoder\Exception\Exception;
use Geocoder\Provider\Nominatim\Nominatim;
use Geocoder\Provider\Yandex\Yandex;
use Geocoder\Query\GeocodeQuery;
use Geocoder\Query\ReverseQuery;
use Geocoder\StatefulGeocoder;
use GuzzleHttp\Client;
use ReflectionException;

/**
 * @link https://geocoder-php.org/docs/providers/nominatim/
 */
class Geocoder {
    public ?int $countryId = null;
    public ?int $regionId = null;
    public ?int $districtId = null;
    public ?int $cityId = null;

    public string $addressEn;
    public string $addressRu;

    private Client $httpClient;
    private \CodeIgniter\HTTP\IncomingRequest|\CodeIgniter\HTTP\CLIRequest $requestApi;
    private Nominatim|Yandex $provider;

    public function __construct() {
        $this->httpClient = new Client();
        $this->requestApi = Services::request();
        $this->provider   = $this->requestApi->getLocale() === 'ru'
            ? new Yandex($this->httpClient, null, getenv('app.geocoder.yandexKey'))
            : Nominatim::withOpenStreetMapServer($this->httpClient, $this->requestApi->getUserAgent());
    }

    /**
     * @throws Exception
     */
    public function search($text): array {
        $result    = [];
        $geocoder  = new StatefulGeocoder($this->provider, $this->requestApi->getLocale());
        $locations = $geocoder->geocodeQuery(GeocodeQuery::create($text))->all();

        if (empty($locations)) {
            return $result;
        }

        foreach ($locations as $location) {
            if (!$location->getLocality()) {
                continue;
            }

            $data  = [
                'lat' => $location->getCoordinates()->getLatitude(),
                'lon' => $location->getCoordinates()->getLongitude(),
                'locality' => $location->getLocality(),
            ];

            if ($location->getCountry()) {
                $data['country'] = $location->getCountry()->getName();
            }

            if ($location->getAdminLevels()->has(1)) {
                $data['region'] = $location->getAdminLevels()->get(1)->getName();
            }

            if ($location->getAdminLevels()->has(2)) {
                $data['district'] = $location->getAdminLevels()->get(2)->getName();
            }

            if ($location->getStreetName()) {
                $data['street'] = $location->getStreetName() . ($location->getStreetNumber() ? ', ' . $location->getStreetNumber() : '');
            }

            $result[] = $data;
        }

        return $result;
    }

    /**
     * @param float $lat
     * @param float $lng
     * @return void
     * @throws Exception
     * @throws ReflectionException
     */
    public function coordinates(float $lat, float $lng): void {
        $geocoderEn = new StatefulGeocoder($this->provider, 'en');
        $geocoderRu = new StatefulGeocoder($this->provider, 'ru');
        $locationEn = $geocoderEn->reverseQuery(ReverseQuery::fromCoordinates($lat, $lng))->first();
        $locationRu = $geocoderRu->reverseQuery(ReverseQuery::fromCoordinates($lat, $lng))->first();

        $countryTitleEn = $locationEn->getCountry()->getName();
        $countryTitleRu = $locationRu->getCountry()->getName();

        $this->_getCountryId($countryTitleEn, $countryTitleRu);

        if ($locationEn->getAdminLevels()->has(1) && $locationRu->getAdminLevels()->has(1)) {
            $regionTitleEn = $locationEn->getAdminLevels()->get(1)->getName();
            $regionTitleRu = $locationRu->getAdminLevels()->get(1)->getName();
            $this->_getRegionId($regionTitleEn, $regionTitleRu);
        }

        if ($locationEn->getAdminLevels()->has(2) && $locationRu->getAdminLevels()->has(2)) {
            $districtTitleEn = $locationEn->getAdminLevels()->get(2)->getName();
            $districtTitleRu = $locationRu->getAdminLevels()->get(2)->getName();
            $this->_getDistrictId($districtTitleEn, $districtTitleRu);
        }

        $this->_getCityId($locationEn->getLocality(), $locationRu->getLocality());

        $this->addressEn = $locationEn->getStreetName() . ($locationEn->getStreetNumber() ? ', ' . $locationEn->getStreetNumber() : '');
        $this->addressRu = $locationRu->getStreetName() . ($locationRu->getStreetNumber() ? ', ' . $locationRu->getStreetNumber() : '');
    }

    /**
     * @param string $titleEn
     * @param string $titleRu
     * @return void
     * @throws ReflectionException
     */
    private function _getCountryId(
        string $titleEn,
        string $titleRu
    ): void
    {
        $countryModel = new LocationCountriesModel();
        $countryData  = $countryModel
            ->select('id')
            ->where([
                'title_en' => $titleEn,
                'title_ru' => $titleRu
            ])
            ->first();

        if ($countryData) {
            $this->countryId = $countryData->id;
            return;
        }

        $country = new \App\Entities\LocationCountry();
        $country->title_en = $titleEn;
        $country->title_ru = $titleRu;

        $countryModel->insert($country);

        $this->countryId = $countryModel->getInsertID();
    }

    /**
     * @param string $titleEn
     * @param string $titleRu
     * @return void
     * @throws ReflectionException
     */
    private function _getRegionId(
        string $titleEn,
        string $titleRu,
    ): void
    {
        if (!$this->countryId) {
            return;
        }

        $regionModel = new LocationRegionsModel();
        $regionData  = $regionModel
            ->select('id')
            ->where([
                'country_id' => $this->countryId,
                'title_en'   => $titleEn,
                'title_ru'   => $titleRu
            ])
            ->first();

        if ($regionData) {
            $this->regionId = $regionData->id;
            return;
        }

        $region = new \App\Entities\LocationRegion();
        $region->country_id = $this->countryId;
        $region->title_en   = $titleEn;
        $region->title_ru   = $titleRu;

        $regionModel->insert($region);

        $this->regionId = $regionModel->getInsertID();
    }

    /**
     * @param string $titleEn
     * @param string $titleRu
     * @return void
     * @throws ReflectionException
     */
    private function _getDistrictId(
        string $titleEn,
        string $titleRu,
    ): void
    {
        if (!$this->countryId || !$this->regionId) {
            return;
        }

        $districtModel = new LocationDistrictsModel();
        $districtData  = $districtModel
            ->select('id')
            ->where([
                'country_id' => $this->countryId,
                'region_id'  => $this->regionId,
                'title_en'   => $titleEn,
                'title_ru'   => $titleRu
            ])
            ->first();

        if ($districtData) {
            $this->districtId = $districtData->id;
            return;
        }

        $district = new \App\Entities\LocationDistrict();
        $district->country_id = $this->countryId;
        $district->region_id  = $this->regionId;
        $district->title_en   = $titleEn;
        $district->title_ru   = $titleRu;

        $districtModel->insert($district);

        $this->districtId = $districtModel->getInsertID();
    }

    /**
     * @param string|null $titleEn
     * @param string|null $titleRu
     * @return void
     * @throws ReflectionException
     */
    private function _getCityId(
        ?string $titleEn,
        ?string $titleRu,
    ): void
    {
        if (!$titleEn && !$titleRu) {
            return;
        }

        $cityModel = new LocationCitiesModel();
        $cityData  = $cityModel
            ->select('id')
            ->where([
                'country_id'  => $this->countryId,
                'region_id'   => $this->regionId,
                'district_id' => $this->districtId,
                'title_en'    => $titleEn,
                'title_ru'    => $titleRu
            ])
            ->first();

        if ($cityData) {
            $this->cityId = $cityData->id;
            return;
        }

        $city = new \App\Entities\LocationCity();
        $city->country_id  = $this->countryId;
        $city->region_id   = $this->regionId;
        $city->district_id = $this->districtId;
        $city->title_en    = $titleEn;
        $city->title_ru    = $titleRu;

        $cityModel->insert($city);

        $this->cityId = $cityModel->getInsertID();
    }
}