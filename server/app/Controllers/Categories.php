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
        $categoriesData  = $categoriesModel->findAll();

        $locale = $this->request->getLocale();
        $result = [];

        if ($categoriesData) {
            foreach ($categoriesData as $item) {
                $result[] = [
                    'name' => $item->name,
                    'title' => $item->{"title_$locale"}
                ];
            }
        }

        return $this->respond(['items'  => $result]);
    }
}