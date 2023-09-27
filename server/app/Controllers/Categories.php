<?php namespace App\Controllers;

use App\Models\CategoryModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Categories extends ResourceController
{
    public function list(): ResponseInterface {
        $categoriesModel = new CategoryModel();

        return $this->respond([
            'items'  => $categoriesModel->findAll()
        ]);
    }
}