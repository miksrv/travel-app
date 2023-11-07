<?php namespace App\Controllers;

use App\Libraries\Session;
use App\Models\PlacesModel;
use App\Models\UsersActivityModel;
use App\Models\UsersBookmarksModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Bookmarks extends ResourceController {

    /**
     * Adds an interesting place to the user's bookmarks
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function set(): ResponseInterface {
        $inputJSON = $this->request->getJSON();
        $session   = new Session();

        if (!$session->isAuth) {
            return $this->failUnauthorized();
        }

        if (empty($inputJSON) || !$inputJSON->place) {
            return $this->failValidationErrors('Point of Interest ID missing');
        }

        try {
            $bookmarkData   = ['user' => $session->userData->id, 'place' => $inputJSON->place];
            $bookmarksModel = new UsersBookmarksModel();
            $bookmarksData  = $bookmarksModel->where($bookmarkData)->first();
            $placesModel    = new PlacesModel();
            $placesData     = $placesModel->find($inputJSON->place);

            if ($bookmarksData) {
                return $this->failValidationErrors('The user already has this place bookmarked');
            }

            if (!$placesData) {
                return $this->failNotFound();
            }

            $bookmarksModel->insert($bookmarkData);

            return $this->respondCreated();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}