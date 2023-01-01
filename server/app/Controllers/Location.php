<?php namespace App\Controllers;

use CodeIgniter\API\ResponseTrait;
use App\Libraries\OverpassAPI;

use App\Models\POIModel;

class Location extends BaseController
{
    use ResponseTrait;

    protected OverpassAPI $OverpassAPI;

    /**
     * Gets the current coordinates of the user, depending on the detection radius, makes a request to the Overpass API
     * to get new points. Returns only a list of those places that are not yet in the database.
     * @return void
     */
    function discover() {
        $data = $this->request->getJSON();

        if (empty($data)) {
            return $this->fail(['status' => 'Empty request']);
        }

        if (!isset($data->lat) || !is_float($data->lat)) {
            return $this->fail(['status' => 'The "lat" variable is required but is empty or missing']);
        }

        if (!isset($data->lon) || !is_float($data->lon)) {
            return $this->fail(['status' => 'The "lon" variable is required but is empty or missing']);
        }

        // Contains coordinates [northmost, southmost, eastmost, westmost]
        $boundingBox = $this->getBoundingBox($data->lat, $data->lon, .5);

        $api = new OverpassAPI();
        $poi = $api->get($boundingBox);

        return $this->respond($poi, 200);
    }

    function poi() {
        $data = $this->request->getJSON();

        if (empty($data)) {
            return $this->fail(['status' => 'Empty request']);
        }

        if (!isset($data->north) || !is_float($data->north)) {
            return $this->fail(['status' => 'The "north" variable is required but is empty or missing']);
        }

        if (!isset($data->south) || !is_float($data->south)) {
            return $this->fail(['status' => 'The "south" variable is required but is empty or missing']);
        }

        if (!isset($data->east) || !is_float($data->east)) {
            return $this->fail(['status' => 'The "east" variable is required but is empty or missing']);
        }

        if (!isset($data->west) || !is_float($data->west)) {
            return $this->fail(['status' => 'The "west" variable is required but is empty or missing']);
        }

        if ($data->north < $data->south) {
            return $this->fail(['status' => 'Value "north" must be greater than value "south']);
        }

        if ($data->west < $data->east) {
            return $this->fail(['status' => 'Value "west" must be greater than value "east']);
        }

        $POIModel = new POIModel();

        $poi = $POIModel
            ->where('latitude <=', $data->north)
            ->where('latitude >=', $data->south)
            ->where('longitude <=', $data->west)
            ->where('longitude >=', $data->east)
            ->findAll();

        return $this->respond($poi, 200);
    }

    function points($seg1 = false) {
        return $this->respond(['test' => $seg1], 200);
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
