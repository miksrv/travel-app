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

        $tagsModel = new TagsModel();
        $tagsData  = $tagsModel->like('title', $search)->findAll(10);
        $response  = [];

        if ($tagsData) {
            foreach ($tagsData as $item) {
                $response[] = $item->title;
            }
        }

        return $this->respond(['items' => $response]);
    }
}