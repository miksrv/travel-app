<?php namespace App\Controllers;

use App\Libraries\Geocoder;
use App\Libraries\Session;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Geocoder\Exception\Exception;

class Location extends ResourceController {
    /**
     * @throws Exception
     */
    public function geocoder(): ResponseInterface {
        $lat = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lng = $this->request->getGet('lng', FILTER_VALIDATE_FLOAT);

        $session = new Session();

        if (!$session->isAuth) {
            return $this->failUnauthorized();
        }

        $geocoder = new Geocoder($lat, $lng);

        return $this->respond((object) ['address' => $geocoder->address]);
    }
}