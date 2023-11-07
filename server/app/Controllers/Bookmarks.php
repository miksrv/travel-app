<?php namespace App\Controllers;

use App\Libraries\Session;
use App\Models\PlacesModel;
use App\Models\UsersBookmarksModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Bookmarks extends ResourceController {

    /**
     * Checks whether this place is already in the user's bookmarks or not
     * @return ResponseInterface
     */
    public function check(): ResponseInterface {
        $placeId = $this->request->getGet('place', FILTER_SANITIZE_SPECIAL_CHARS);
        $session = new Session();

        if (!$session->isAuth) {
            return $this->respond(['result' => false]);
        }

        if (!$placeId) {
            return $this->failValidationErrors('Point of Interest ID missing');
        }

        $bookmarksModel = new UsersBookmarksModel();
        $bookmarkData   = $bookmarksModel
            ->select('id')
            ->where(['user' => $session->userData->id, 'place' => $placeId])
            ->first();

        return $this->respond(['result' => !$bookmarkData]);
    }

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
                $bookmarksModel->delete($bookmarksData->id);

                return $this->respondDeleted();
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