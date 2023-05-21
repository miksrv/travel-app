<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Introduce extends ResourceController
{
    public function hello()
    {
        $lat = $this->request->getGet('lat', FILTER_SANITIZE_NUMBER_FLOAT);
        $lon = $this->request->getGet('lon', FILTER_SANITIZE_NUMBER_FLOAT);

        $ip = $this->request->getIPAddress();
        $ua = $this->request->getUserAgent();


        echo '<pre>';
        var_dump($lat);
        var_dump($lon);
        var_dump($ip);
        var_dump($ua);
        exit();
    }
}