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
        // left (lon), top (lat), right (lon), bottom (lat)
        $bounds = $this->request->getGet('bounds', FILTER_SANITIZE_STRING);
        $bounds = explode(',', $bounds);

        $places = new PlacesModel();
        $items = $places
            ->select('id, category, latitude, longitude')
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
        try {
            $places = new PlacesModel();
            $item = $places->find($id);

            if ($item) {
                unset(
                    $item->tags, $item->address, $item->address_country,
                    $item->address_region, $item->address_district, $item->address_city
                );

                return $this->respond($item);
            }

            return $this->failNotFound();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}