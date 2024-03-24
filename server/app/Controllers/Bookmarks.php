<?php namespace App\Controllers;

use App\Libraries\SessionLibrary;
use App\Models\PlacesModel;
use App\Models\UsersBookmarksModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Exception;
use ReflectionException;

class Bookmarks extends ResourceController {

    protected SessionLibrary $session;

    public function __construct() {
        $this->session = new SessionLibrary();
    }

    /**
     * Checks whether this place is already in the user's bookmarks or not
     * @return ResponseInterface
     */
    public function check(): ResponseInterface {
        $placeId = $this->request->getGet('place', FILTER_SANITIZE_SPECIAL_CHARS);

        if (!$this->session->isAuth) {
            return $this->respond(['result' => false]);
        }

        if (!$placeId) {
            return $this->failValidationErrors('Point of Interest ID missing');
        }

        $bookmarksModel = new UsersBookmarksModel();
        $bookmarkData   = $bookmarksModel
            ->select('id')
            ->where(['user_id' => $this->session->user?->id, 'place_id' => $placeId])
            ->first();

        return $this->respond(['result' => !$bookmarkData]);
    }

    /**
     * Adds an interesting place to the user's bookmarks
     * @return ResponseInterface
     */
    public function set(): ResponseInterface {
        $input   = $this->request->getJSON();

        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        if (empty($input) || !$input->place) {
            return $this->failValidationErrors('Point of Interest ID missing');
        }

        try {
            $bookmarkData   = ['user_id' => $this->session->user?->id, 'place_id' => $input->place];
            $bookmarksModel = new UsersBookmarksModel();
            $placesModel    = new PlacesModel();
            $bookmarksData  = $bookmarksModel->where($bookmarkData)->first();
            $placesData     = $placesModel->find($input->place);

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