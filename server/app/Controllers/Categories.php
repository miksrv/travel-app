<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Models\CategoryModel;
use App\Models\PlacesModel;
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
        $places = $this->request->getGet('places', FILTER_VALIDATE_BOOLEAN) ?? false;
        $locale = $this->request->getLocale();
        $result = [];

        $placesModel     = new PlacesModel();
        $categoriesModel = new CategoryModel();
        $categoriesData  = $categoriesModel
            ->select("name, title_$locale as title" . ($places ? ", content_$locale as content" : ''))
            ->orderBy("title_$locale", 'ASC')
            ->findAll();

        if ($categoriesData) {
            foreach ($categoriesData as $item) {
                $category = (object) [
                    'name' => $item->name,
                    'title' => $item->title
                ];

                if ($places) {
                    $category->content = $item->content;
                    $category->count   = $placesModel
                        ->select('id')
                        ->where('category', $item->name)
                        ->countAllResults();
                }

                $result[] = $category;
            }
        }

        return $this->respond(['items'  => $result]);
    }
}