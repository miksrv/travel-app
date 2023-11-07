<?php namespace App\Controllers;

use App\Libraries\Session;
use App\Models\PlacesModel;
use App\Models\UsersVisitedPlacesModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Visited extends ResourceController {
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
            $insertData   = ['user' => $session->userData->id, 'place' => $inputJSON->place];
            $visitedModel = new UsersVisitedPlacesModel();
            $visitedData  = $visitedModel->where($insertData)->first();
            $placesModel  = new PlacesModel();
            $placesData   = $placesModel->find($inputJSON->place);

            if ($visitedData) {
                $visitedModel->delete($visitedData->id);

                return $this->respondDeleted();
            }

            if (!$placesData) {
                return $this->failNotFound();
            }

            $visitedModel->insert($insertData);

            return $this->respondCreated();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}