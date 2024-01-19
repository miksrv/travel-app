<?php namespace App\Controllers;

use App\Models\LocationRegionsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Regions extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $regionsModel = new LocationRegionsModel();

        return $this->respond([
            'items'  => $regionsModel->findAll()
        ]);
    }
}