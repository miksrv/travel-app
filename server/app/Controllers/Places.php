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

class Places extends ResourceController
{
    public function list()
    {
        $filterCountry  = $this->request->getGet('country', FILTER_SANITIZE_NUMBER_INT);
        $filterProvince = $this->request->getGet('province', FILTER_SANITIZE_NUMBER_INT);
        $filterArea     = $this->request->getGet('area', FILTER_SANITIZE_NUMBER_INT);
        $filterCity     = $this->request->getGet('city', FILTER_SANITIZE_NUMBER_INT);
        $filterAuthor   = $this->request->getGet('author', FILTER_SANITIZE_NUMBER_INT);

        $filterCategory    = $this->request->getGet('category', FILTER_SANITIZE_STRING);
        $filterSubCategory = $this->request->getGet('subcategory', FILTER_SANITIZE_STRING);

        $bounds = $this->request->getGet('bounds', FILTER_SANITIZE_STRING);

        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT);
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT);

        // left (lon), top (lat), right (lon), bottom (lat)
        $bounds = explode(',', $bounds);

        $places = new PlacesModel();
        $items = $places->where([
            'longitude >=' => $bounds[0],
            'latitude >=' => $bounds[1],
            'longitude <=' =>  $bounds[2],
            'latitude <=' =>  $bounds[3],
        ])->findAll();

        return $this->respond([
            'items' => $items,
        ]);
    }
}