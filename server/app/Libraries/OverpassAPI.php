<?php namespace App\Libraries;

use App\Models\POIModel;
use App\Entities\POI;

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

        foreach($data as $key => $row) {
            $item = (object) $row;

            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'hotel') continue;
            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'guest_house') continue;
            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'hostel') continue;
            if (isset($item->tags['natural']) && $item->tags['natural'] === 'tree') continue;

            $category = $this->_defineCategory($item->tags);

            $findPOI = $POIModel->where('overpass_id', $item->id)->first();

            if (!$findPOI) {
                $POI = new POI();

                $POI->id          = uniqid();
                $POI->overpass_id = $item->id;
                $POI->category    = $category;
                $POI->subcategory = $item->tags[$category];
                $POI->latitude    = $item->lat;
                $POI->longitude   = $item->lon;

                $POIModel->insert($POI);
            } else {
                $POI = $findPOI;
            }



//            $poi = [
//                'overpass_api'  => $poi->id,
//                'lat' => $poi->lat,
//                'lon' => $poi->lon,
//                'category' => $category,
//                'subcategory' => $poi->tags[$category],
//                'name' => $poi->tags['name'] ?? 'Не известно',
//                'tags' => $this->_cleanTags($poi->tags, $category),
//            ];

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

    protected function _cleanTags(array $tags, string $category): array {
        unset($tags[$category]);
        unset($tags['name']);

        return $tags;
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
