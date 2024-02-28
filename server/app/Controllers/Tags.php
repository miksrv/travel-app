<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Models\TagsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Tags extends ResourceController {
    public function __construct() {
        new LocaleLibrary();
    }
    /**
     * Find all tags by search text
     * @return ResponseInterface
     */
    public function search(): ResponseInterface {
        $search = $this->request->getGet('search', FILTER_SANITIZE_STRING);
        $locale = $this->request->getLocale();

        $response  = [];
        $tagsModel = new TagsModel();
        $tagsData  = $tagsModel
            ->like('title_ru', $search)
            ->orLike('title_en', $search)
            ->findAll(10);

        if ($tagsData) {
            foreach ($tagsData as $item) {
                $response[] = $locale === 'en' && !empty($item->title_en)
                    ? $item->title_en
                    : (!empty($item->title_ru) ? $item->title_ru : $item->title_en);
            }
        }

        return $this->respond(['items' => $response]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        $tagsModel = new TagsModel();
        $tagsData  = $tagsModel->find($id);
        $locale    = $this->request->getLocale();

        if (!$tagsData) {
            return $this->failNotFound();
        }

        return $this->respond([
            'id'    => $tagsData->id,
            'title' => $locale === 'en' && !empty($tagsData->title_en)
                ? $tagsData->title_en
                : (!empty($tagsData->title_ru) ? $tagsData->title_ru : $tagsData->title_en)
        ]);
    }
}