<?php namespace App\Controllers;

use App\Models\PlacesModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Poi extends ResourceController
{
    public function list(): ResponseInterface
    {
        $bounds = $this->request->getGet('bounds', FILTER_SANITIZE_STRING);
        $bounds = explode(',', $bounds);

        $places = new PlacesModel();
        $items = $places
            ->select('id, category, subcategory, title, latitude, longitude')
            ->where([
                'longitude >=' => $bounds[0],
                'latitude >=' => $bounds[1],
                'longitude <=' =>  $bounds[2],
                'latitude <=' =>  $bounds[3],
            ])->findAll();

        return $this->respond([
            'items' => $items,
        ]);
    }

    public function show($id = null): ResponseInterface
    {
        $places = new PlacesModel();
        $item = $places->find($id);

        return $this->respond($item);
    }
}