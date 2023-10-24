<?php namespace App\Controllers;

use App\Models\AddressDistrict;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Districts extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $districtsModel = new AddressDistrict();

        return $this->respond([
            'items'  => $districtsModel->findAll()
        ]);
    }
}