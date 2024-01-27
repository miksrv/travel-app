<?php namespace App\Controllers;

use App\Models\TagsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Tags extends ResourceController {
    /**
     * Find all tags by search text
     * @return ResponseInterface
     */
    public function search(): ResponseInterface {
        $search = $this->request->getGet('search', FILTER_SANITIZE_STRING);
        $locale = $this->request->getLocale();

        $tagsModel = new TagsModel();
        $tagsData  = $tagsModel->like('title_' . $locale, $search)->findAll(10);
        $response  = [];

        if ($tagsData) {
            foreach ($tagsData as $item) {
                $response[] = $item->{"title_$locale"};
            }
        }

        return $this->respond(['items' => $response]);
    }
}