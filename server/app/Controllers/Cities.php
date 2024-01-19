<?php namespace App\Controllers;

use App\Models\LocationCitiesModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Cities extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $citiesModel = new LocationCitiesModel();
        $citiesData  = $citiesModel
            ->select(
                'address_city.*, address_district.name as district_name, 
                address_region.name as region_name, address_country.name as country_name')
            ->join('address_district', 'address_city.district = address_district.id', 'left')
            ->join('address_region', 'address_city.region = address_region.id', 'left')
            ->join('address_country', 'address_city.country = address_country.id', 'left')
            ->findAll();

        $response = [];

        if (empty($citiesData)) {
            return $this->respond(['items'  => $response]);
        }

        foreach ($citiesData as $city) {
            $result = [
                'id'    => (int) $city->id,
                'name'  => $city->name,
            ];

            if ($city->district_name) {
                $result['district'] = [
                    'id'   => $city->district,
                    'name' => $city->district_name,
                ];
            }

            if ($city->region_name) {
                $result['region'] = [
                    'id'   => $city->region,
                    'name' => $city->region_name,
                ];
            }

            if ($city->country_name) {
                $result['country'] = [
                    'id'   => $city->country,
                    'name' => $city->country_name,
                ];
            }

            $response[] = $result;
        }

        return $this->respond(['items'  => $response]);
    }
}