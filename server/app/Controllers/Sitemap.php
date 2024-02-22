<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Models\PlacesModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Sitemap extends ResourceController {
    public function __construct() {
        new LocaleLibrary();
    }

    /**
     * @return ResponseInterface
     */
    public function index(): ResponseInterface {
        $placesModel = new PlacesModel();
        $usersModel  = new UsersModel();

        $placesData = $placesModel->select('id, updated_at')->findAll();
        $usersData  = $usersModel->select('id, updated_at')->findAll();

        $placesList = [];
        $usersList  = [];

        foreach ($placesData as $place) {
            $placesList[] = [
                'id'      => $place->id,
                'updated' => $place->updated_at
            ];
        }

        foreach ($usersData as $user) {
            $usersList[] = [
                'id'      => $user->id,
                'updated' => $user->updated_at
            ];
        }

        return $this->respond([
            'places' => $placesList,
            'users'  => $usersList,
        ]);
    }
}