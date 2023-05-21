<?php namespace App\Controllers;

use App\Libraries\OverpassAPI;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Place extends ResourceController
{
    public function list(): ResponseInterface
    {
        $filterCountry  = $this->request->getGet('country', FILTER_SANITIZE_NUMBER_INT);
        $filterProvince = $this->request->getGet('province', FILTER_SANITIZE_NUMBER_INT);
        $filterArea     = $this->request->getGet('area', FILTER_SANITIZE_NUMBER_INT);
        $filterCity     = $this->request->getGet('city', FILTER_SANITIZE_NUMBER_INT);
        $filterAuthor   = $this->request->getGet('author', FILTER_SANITIZE_NUMBER_INT);

        $filterCategory    = $this->request->getGet('category', FILTER_SANITIZE_NUMBER_INT);
        $filterSubCategory = $this->request->getGet('subcategory', FILTER_SANITIZE_NUMBER_INT);

        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT);
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT);

//        $overpassAPI = new OverpassAPI();
//        $boundingBox = $overpassAPI->getBoundingBox(37.341021, -121.642181, 2);
//        $pointsList  = $overpassAPI->get($boundingBox);
//
//        return $this->respond([
//            'items' => $pointsList,
//        ]);
    }
}