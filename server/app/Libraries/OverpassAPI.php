<?php namespace App\Libraries;

class OverpassAPI {
    protected string $url = 'http://overpass-api.de/api/interpreter';

    function get(array $bbox): array {
        $overpass_bbox = "{$bbox[0]},{$bbox[2]},{$bbox[1]},{$bbox[3]}";
        $overpass = $this->url . '?data=[out:json][timeout:25];(node[historic](' . $overpass_bbox . ');node[natural](' . $overpass_bbox . ');node[tourism](' . $overpass_bbox . '););out;';

        $html = file_get_contents($overpass);
        $result = json_decode($html, true);

        $data = $result['elements'];

        $result = [];

        foreach($data as $key => $row) {
            $poi = (object) $row;

            if (isset($poi->tags['tourism']) && $poi->tags['tourism'] === 'hotel') continue;
            if (isset($poi->tags['tourism']) && $poi->tags['tourism'] === 'guest_house') continue;
            if (isset($poi->tags['tourism']) && $poi->tags['tourism'] === 'hostel') continue;
            if (isset($poi->tags['natural']) && $poi->tags['natural'] === 'tree') continue;

            $result[] = (object) [
                'lat' => $poi->lat,
                'lon' => $poi->lon,
                'name' => $poi->tags['name'] ?? 'Не известно',
                'all' => $poi->tags,
            ];
        }

        return $result;
    }
}
