<?php namespace App\Controllers;

use App\Models\AddressCountry;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Countries extends ResourceController
{
    public function list(): ResponseInterface {
        $countriesModel = new AddressCountry();

        return $this->respond([
            'items'  => $countriesModel->findAll()
        ]);
    }
}