<?php namespace App\Controllers;

use App\Models\AddressRegion;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Regions extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $regionsModel = new AddressRegion();

        return $this->respond([
            'items'  => $regionsModel->findAll()
        ]);
    }
}