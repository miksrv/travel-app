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
        $search = trim($this->request->getGet('search', FILTER_SANITIZE_STRING));
        $locale = $this->request->getLocale();

        if (strlen($search) === 0 || strlen($search) >= 30) {
            return $this->respond(['items' => []]);
        }

        $response  = [];
        $tagsModel = new TagsModel();
        $tagsData  = $tagsModel
            ->orLike(['title_ru' => $search, 'title_en' => $search])
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
}