<?php

namespace App\Controllers;

use App\Models\LocationDistrictsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Districts extends ResourceController
{
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface
    {
        $districtsModel = new LocationDistrictsModel();

        return $this->respond([
            'items'  => $districtsModel->findAll()
        ]);
    }
}