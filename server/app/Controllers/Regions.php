<?php namespace App\Controllers;

use App\Models\AddressRegion;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Regions extends ResourceController
{
    public function list(): ResponseInterface {
        $regionsModel = new AddressRegion();

        return $this->respond([
            'items'  => $regionsModel->findAll()
        ]);
    }
}