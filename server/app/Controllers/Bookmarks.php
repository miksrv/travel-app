<?php

namespace App\Controllers;

use App\Libraries\SessionLibrary;
use App\Models\PlacesModel;
use App\Models\UsersBookmarksModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Exception;

class Bookmarks extends ResourceController {

    protected SessionLibrary $session;

    public function __construct() {
        $this->session = new SessionLibrary();
    }

    /**
     * Checks whether this place is already in the user's bookmarks or not
     * @return ResponseInterface
     */
    public function check(): ResponseInterface
    {
        $placeId = $this->request->getGet('placeId', FILTER_SANITIZE_SPECIAL_CHARS);

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

        return $this->respond(['result' => !!$bookmarkData]);
    }

    /**
     * Adds an interesting place to the user's bookmarks
     * @return ResponseInterface
     */
    public function set(): ResponseInterface
    {
        $input = $this->request->getJSON();

        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        if (empty($input) || !$input->placeId) {
            return $this->failValidationErrors('Point of Interest ID missing');
        }

        try {
            $bookmarkData   = ['user_id' => $this->session->user?->id, 'place_id' => $input->placeId];
            $bookmarksModel = new UsersBookmarksModel();
            $placesModel    = new PlacesModel();
            $bookmarksData  = $bookmarksModel->where($bookmarkData)->first();
            $placesData     = $placesModel->select('bookmarks, updated_at')->find($input->placeId);
            $bookmarksCount = $placesData->bookmarks;

            if (!$placesData) {
                return $this->failNotFound();
            }

            if ($bookmarksData) {
                $bookmarksModel->delete($bookmarksData->id);
                $placesModel->update($input->placeId, [
                    'bookmarks'  => ($bookmarksCount - 1 <= 0) ? 0 : $bookmarksCount - 1,
                    'updated_at' => $placesData->updated_at
                ]);

                return $this->respondDeleted();
            }

            $bookmarksModel->insert($bookmarkData);

            // Update the bookmarks count
            $placesModel->update($input->placeId, [
                'bookmarks'  => $bookmarksCount = 1,
                'updated_at' => $placesData->updated_at
            ]);

            return $this->respondCreated();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}