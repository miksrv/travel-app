<?php namespace App\Controllers;

use App\Models\AddressCountry;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Countries extends ResourceController {
    public function list(): ResponseInterface {
        $countriesModel = new AddressCountry();

        return $this->respond([
            'items'  => $countriesModel->findAll()
        ]);
    }
}