<?php namespace App\Controllers;

use App\Models\CategoryModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

/**
 * Categories API controller (not use now)
 */
class Categories extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $categoriesModel = new CategoryModel();

        return $this->respond([
            'items'  => $categoriesModel->findAll()
        ]);
    }
}