<?php namespace App\Controllers;

use App\Models\PlacesModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Sitemap extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function index(): ResponseInterface {
        $placesModel = new PlacesModel();
        $usersModel  = new UsersModel();

        return $this->respond([
            'places' => $placesModel->select('id, updated_at as updated')->findAll(),
            'users'  => $usersModel->select('id, updated_at as updated')->findAll(),
        ]);
    }
}