<?php

namespace App\Controllers;

class Location extends BaseController
{
    /**
     * The array contains input data obtained via GET or POST
     * @var array
     */
    protected $source;

    /**
     * Device data
     * @var
     */
    protected array $rawData;

    /**
     * Device request source string
     * @var
     */
    protected string $rawInput;


    function update() {
        $this->_select_source();

        $data = [
            'lat' => $this->source->lat,
            'lon' => $this->source->lon,
        ];

        $response = ['state' => TRUE, 'data' => (object) $data];

        $this->_response($response, 200);
    }

    function test() {
        $lat = 42.746413;
        $lon = 75.250034;

        $bbox = $this->getBoundingBox($lat,$lon,10);

        //$overpass = 'http://overpass-api.de/api/interpreter?data=[out:json];area(3600046663)->.searchArea;(node["amenity"="drinking_water"](area.searchArea););out;';

        $overpass_bbox = "{$bbox[0]},{$bbox[2]},{$bbox[1]},{$bbox[3]}";
        $overpass = 'http://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node[historic](' . $overpass_bbox . ');node[natural](' . $overpass_bbox . ');node[tourism](' . $overpass_bbox . '););out;';

        $html = file_get_contents($overpass);
        $result = json_decode($html, true); // "true" to get PHP array instead of an object

        $data = $result['elements'];

        var_dump(count($data));

        foreach($data as $key => $row) {
            $poi = (object) $row;

            if ($poi->tags && $poi->tags['tourism'] === 'hotel') continue;
            if ($poi->tags && $poi->tags['tourism'] === 'guest_house') continue;
            if ($poi->tags && $poi->tags['natural'] === 'tree') continue;

            echo '<pre>';
            var_dump($poi);
            echo '</pre>';
        }
    }

    function getBoundingBox($lat_degrees,$lon_degrees,$distance_in_miles) {

        $radius = 3963.1; // of earth in miles

        // bearings - FIX
        $due_north = deg2rad(0);
        $due_south = deg2rad(180);
        $due_east = deg2rad(90);
        $due_west = deg2rad(270);

        // convert latitude and longitude into radians
        $lat_r = deg2rad($lat_degrees);
        $lon_r = deg2rad($lon_degrees);

        // find the northmost, southmost, eastmost and westmost corners $distance_in_miles away
        // original formula from
        // http://www.movable-type.co.uk/scripts/latlong.html

        $northmost  = asin(sin($lat_r) * cos($distance_in_miles/$radius) + cos($lat_r) * sin ($distance_in_miles/$radius) * cos($due_north));
        $southmost  = asin(sin($lat_r) * cos($distance_in_miles/$radius) + cos($lat_r) * sin ($distance_in_miles/$radius) * cos($due_south));

        $eastmost = $lon_r + atan2(sin($due_east)*sin($distance_in_miles/$radius)*cos($lat_r),cos($distance_in_miles/$radius)-sin($lat_r)*sin($lat_r));
        $westmost = $lon_r + atan2(sin($due_west)*sin($distance_in_miles/$radius)*cos($lat_r),cos($distance_in_miles/$radius)-sin($lat_r)*sin($lat_r));


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

        return array($lat1,$lat2,$lon1,$lon2);
    }

    /**
     * The method defines a global variable as a data source
     * @return mixed
     */
    protected function _select_source() {
        if ( ! empty($this->request->getJSON())) {
            return $this->source =$this->request->getJSON();
        }

        $response = array('state' => false, 'error' => 'Empty data input array');

        log_message('error', '[' .  __METHOD__ . '] {error}', $response);

        $this->_response($response);
    }

    /**
     * Generates an answer for the client
     * @param $data
     * @param int $code
     */
    protected function _response($data, $code = 400)
    {
        $this->response
            ->setStatusCode($code)
            ->setJSON($data)
            ->send();

        exit();
    }
}
