<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Models\CategoryModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

/**
 * Categories API controller (not use now)
 */
class Categories extends ResourceController {
    public function __construct() {
        new LocaleLibrary();
    }

    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $locale = $this->request->getLocale();
        $result = [];

        $categoriesModel = new CategoryModel();
        $categoriesData  = $categoriesModel->orderBy("title_$locale", 'ASC')->findAll();

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