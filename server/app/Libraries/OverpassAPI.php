<?php namespace App\Libraries;

class OverpassAPI {
    protected string $url = 'http://overpass-api.de/api/interpreter';

    /**
     * All categories: https://wiki.openstreetmap.org/wiki/Map_features
     * @var array|string[]
     */
    protected array $overpass_categories = [
        'historic',
        'natural',
        'tourism',
//        'landuse'
    ];

    function get(array $bbox): array {
        $overpass_bbox = "{$bbox[0]},{$bbox[2]},{$bbox[1]},{$bbox[3]}";

        $overpass_url = $this->url . '?data=[out:json][timeout:25];(';

        foreach ($this->overpass_categories as $category) {
            $overpass_url .= 'node[' . $category . '](' . $overpass_bbox . ');';
        }

        $overpass_url .= ');out;';

        $html   = file_get_contents($overpass_url);
        $result = json_decode($html, true);
        $data   = $result['elements'];
        $result = [];

        foreach($data as $row) {
            $item = (object) $row;

            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'hotel') continue;
            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'guest_house') continue;
            if (isset($item->tags['tourism']) && $item->tags['tourism'] === 'hostel') continue;
            if (isset($item->tags['natural']) && $item->tags['natural'] === 'tree') continue;

            $item->category = $this->_defineCategory($item->tags);

            $result[] = $item;
        }

        return $result;
    }

    protected function _defineCategory(array $tags): string {
        foreach ($this->overpass_categories as $category) {
            if (array_key_exists($category, $tags)) {
                return $category;
            }
        }

        return '';
    }

    /**
     * Returns the extreme points of the coordinates, finding them by the current coordinates and radius
     *
     * @param float $lat
     * @param float $lon
     * @param float $distance_in_km
     * @return array [northmost, southmost, eastmost, westmost]
     */
    function getBoundingBox(float $lat, float $lon, float $distance_in_km): array {
        $radius = 6378.14; // of earth in kilometers

        // bearings - FIX
        $due_north = deg2rad(0);
        $due_south = deg2rad(180);
        $due_east = deg2rad(90);
        $due_west = deg2rad(270);

        // convert latitude and longitude into radians
        $lat_r = deg2rad($lat);
        $lon_r = deg2rad($lon);

        // find the northmost, southmost, eastmost and westmost corners $distance_in_km away
        // original formula from
        // http://www.movable-type.co.uk/scripts/latlong.html

        $northmost = asin(sin($lat_r) * cos($distance_in_km/$radius) + cos($lat_r) * sin ($distance_in_km/$radius) * cos($due_north));
        $southmost = asin(sin($lat_r) * cos($distance_in_km/$radius) + cos($lat_r) * sin ($distance_in_km/$radius) * cos($due_south));

        $eastmost = $lon_r + atan2(sin($due_east)*sin($distance_in_km/$radius)*cos($lat_r),cos($distance_in_km/$radius)-sin($lat_r)*sin($lat_r));
        $westmost = $lon_r + atan2(sin($due_west)*sin($distance_in_km/$radius)*cos($lat_r),cos($distance_in_km/$radius)-sin($lat_r)*sin($lat_r));


        $northmost = rad2deg($northmost);
        $southmost = rad2deg($southmost);
        $eastmost = rad2deg($eastmost);
        $westmost = rad2deg($westmost);

        // sort the lat and long so that we can use them for a between query
        if ($northmost > $southmost) {
            $lat1 = $southmost;
            $lat2 = $northmost;

        } else {
            $lat1 = $northmost;
            $lat2 = $southmost;
        }


        if ($eastmost > $westmost) {
            $lon1 = $westmost;
            $lon2 = $eastmost;

        } else {
            $lon1 = $eastmost;
            $lon2 = $westmost;
        }

        return [$lat1, $lat2, $lon1, $lon2];
    }
}