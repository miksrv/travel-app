<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Models\TagsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Tags extends ResourceController {
    /**
     * Find all tags by search text
     * @return ResponseInterface
     */
    public function search(): ResponseInterface {
        $localeLibrary = new LocaleLibrary();

        $search = $this->request->getGet('search', FILTER_SANITIZE_STRING);

        $tagsModel = new TagsModel();
        $tagsData  = $tagsModel->like('title_' . $localeLibrary->locale, $search)->findAll(10);
        $response  = [];

        if ($tagsData) {
            foreach ($tagsData as $item) {
                $response[] = $item->{"title_$localeLibrary->locale"};
            }
        }

        return $this->respond(['items' => $response]);
    }
}