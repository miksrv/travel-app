<?php namespace App\Libraries;

use App\Models\AddressCity;
use App\Models\AddressCountry;
use App\Models\AddressDistrict;
use App\Models\AddressRegion;
use Config\Services;
use Geocoder\Exception\Exception;
use Geocoder\Provider\Nominatim\Nominatim;
use Geocoder\Query\ReverseQuery;
use Geocoder\StatefulGeocoder;
use GuzzleHttp\Client;
use ReflectionException;

class Geocoder {
    public ?int $countryID;
    public ?int $regionID;
    public ?int $districtID;
    public ?int $cityID;

    public string $address;

    /**
     * @param $latitude
     * @param $longitude
     * @throws Exception|ReflectionException
     */
    public function __construct($latitude, $longitude) {
        $request    = Services::request();
        $httpClient = new Client();

        $provider = Nominatim::withOpenStreetMapServer($httpClient, $request->getUserAgent());
        $geocoder = new StatefulGeocoder($provider, 'ru');
        $result   = $geocoder->reverseQuery(ReverseQuery::fromCoordinates($latitude, $longitude))->first();

        $adminLevels = count($result->getAdminLevels());

        $this->countryID = $this->getCountry($result->getCountry()->getName());

        $this->regionID = $adminLevels >= 1 ? $this->getRegion(
            $result->getAdminLevels()->get(1)->getName(),
            $this->countryID
        ) : null;

        $this->districtID = $adminLevels >= 2 ? $this->getDistrict(
            $result->getAdminLevels()->get(2)->getName(),
            $this->countryID,
            $this->regionID
        ) : null;

        $this->cityID = $this->getCity(
            $result->getLocality(),
            $this->countryID,
            $this->regionID,
            $this->districtID
        );

        $this->address = $result->getStreetName() . ($result->getStreetNumber() ? ', ' . $result->getStreetNumber() : '');
    }

    /**
     * Ищет страну по названию, если такой нет - добавляет. Возвращает ID страны из БД
     * @param string $name
     * @return int
     * @throws ReflectionException
     */
    protected function getCountry(string $name): int
    {
        $countryModel = new AddressCountry();
        $countryData  = $countryModel->where(['name' => $name])->first();

        if ($countryData) {
            return $countryData->id;
        }

        $country = new \App\Entities\AddressCountry();
        $country->name = $name;

        $countryModel->insert($country);

        return $countryModel->getInsertID();
    }

    /**
     * Возвращает ID региона
     * @param string $name
     * @param int $country
     * @return int
     * @throws ReflectionException
     */
    protected function getRegion(string $name, int $country): int
    {
        $regionModel = new AddressRegion();
        $regionData  = $regionModel->where(['name' => $name, 'country' => $country])->first();

        if ($regionData) {
            return $regionData->id;
        }

        $region = new \App\Entities\AddressRegion();
        $region->country = $country;
        $region->name    = $name;

        $regionModel->insert($region);

        return $regionModel->getInsertID();
    }

    /**
     * Возвращает ID региона
     * @param string $name
     * @param int $country
     * @param int|null $region
     * @return int
     * @throws ReflectionException
     */
    protected function getDistrict(string $name, int $country, ?int $region = null): int
    {
        $districtModel = new AddressDistrict();
        $districtData  = $districtModel->where(['name' => $name, 'country' => $country, 'region' => $region])->first();

        if ($districtData) {
            return $districtData->id;
        }

        $district = new \App\Entities\AddressDistrict();
        $district->country = $country;
        $district->region  = $region;
        $district->name    = $name;

        $districtModel->insert($district);

        return $districtModel->getInsertID();
    }

    /**
     * @param string|null $name
     * @param int $country
     * @param int|null $region
     * @param int|null $district
     * @return int|null
     * @throws ReflectionException
     */
    protected function getCity(?string $name, int $country, ?int $region = null, ?int $district = null): ?int
    {
        if (!$name) {
            return null;
        }

        $cityModel = new AddressCity();
        $cityData  = $cityModel->where(['name' => $name, 'country' => $country, 'region' => $region, 'district' => $district])->first();

        if ($cityData) {
            return $cityData->id;
        }

        $city = new \App\Entities\AddressCity();
        $city->country  = $country;
        $city->region   = $region;
        $city->district = $district;
        $city->name     = $name;

        $cityModel->insert($city);

        return $cityModel->getInsertID();
    }
}