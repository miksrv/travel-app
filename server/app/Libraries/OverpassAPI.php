<?php namespace App\Libraries;

use App\Models\POIModel;
use App\Models\CategoryModel;
use App\Models\SubcategoryModel;

use App\Entities\POI;
use App\Entities\Category;
use App\Entities\Subcategory;

class OverpassAPI {
    protected string $url = 'http://overpass-api.de/api/interpreter';

    protected array $overpass_categories = [
        'historic',
        'natural',
        'tourism'
    ];

    function get(array $bbox): array {
        $overpass_bbox = "{$bbox[0]},{$bbox[2]},{$bbox[1]},{$bbox[3]}";

        $overpass_url = $this->url . '?data=[out:json][timeout:25];(';

        foreach ($this->overpass_categories as $category) {
            $overpass_url .= 'node[' . $category . '](' . $overpass_bbox . ');';
        }

        $overpass_url .= ');out;';

        $html = file_get_contents($overpass_url);
        $result = json_decode($html, true);

        $data = $result['elements'];

        $result = [];

        $POIModel = new POIModel();
        $CategoryModel = new CategoryModel();
        $SubcategoryModel = new SubcategoryModel();

        foreach($data as $key => $row) {
            $item = (object) $row;

            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'hotel') continue;
            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'guest_house') continue;
            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'hostel') continue;
            if (isset($item->tags['natural']) && $item->tags['natural'] === 'tree') continue;

            $category = $this->_defineCategory($item->tags);

            $findPOI = $POIModel->where('overpass_id', $item->id)->first();

            if ($findPOI) {
                $result[] = $findPOI;
                continue;
            }

            $findCategory = $CategoryModel->where('name', $category)->first();

            if (!$findCategory) {
                $CategoryModel->insert(['name' => $category]);
                $categoryId = $CategoryModel->getInsertID();
            }

            $findSubcategory = $SubcategoryModel->where('category', $findCategory ? $findCategory->id : $categoryId)->first();

            if (!$findSubcategory) {
                $SubcategoryModel->insert(['name' => $item->tags[$category], 'category' => $findCategory ? $findCategory->id : $categoryId]);
                $subcategoryId = $SubcategoryModel->getInsertID();
            }

            $POI = new POI();

            $POI->id          = uniqid();
            $POI->overpass_id = $item->id;
            $POI->category    = $findCategory ? $findCategory->id : $categoryId;
            $POI->subcategory = $findSubcategory ? $findSubcategory->id : $subcategoryId;
            $POI->latitude    = $item->lat;
            $POI->longitude   = $item->lon;
            $POI->tags        = $this->_cleanTags($item->tags, $category);

            $POIModel->insert($POI);

            $result[] = $POI;
        }

        return $result;
    }

    protected function _savePOI(POI $data) {
        $POIModel = new POIModel();

        if (!$POIModel->where('overpass_id', $data->overpass_id)->countAllResults()) {
            $data->id = uniqid();
            $POIModel->insert($data);
        }
    }

    protected function _cleanTags(array $tags, string $category): object {
        unset($tags[$category]);
        unset($tags['name']);

        return (object) $tags;
    }

    protected function _defineCategory(array $tags): string {
        foreach ($this->overpass_categories as $category) {
            if (array_key_exists($category, $tags)) {
                return $category;
            }
        }

        return '';
    }
}
