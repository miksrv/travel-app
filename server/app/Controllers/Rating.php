<?php namespace App\Controllers;

use App\Libraries\Session;
use App\Libraries\UserActivity;
use App\Libraries\UserNotify;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Rating extends ResourceController {
    /**
     * !!NOT USED!!
     * Список всех оценок для конкретного места
     * @param $id
     * @return ResponseInterface
     */
//    public function show($id = null): ResponseInterface {
//        try {
//            $session     = new Session();
//            $ratingModel = new RatingModel();
//            $ratingData  = $ratingModel
//                ->select('rating.*, users.id as user_id, users.name as user_name, users.avatar as user_avatar')
//                ->join('users', 'rating.author = users.id', 'left')
//                ->where('place', $id)
//                ->findAll();
//
//            $result = [];
//
//            if (!empty($ratingData)) {
//                foreach ($ratingData as $item) {
//                     $tmpData = [
//                         'created' => $item->created_at,
//                         'session' => $item->session,
//                         'value'   => (int) $item->value
//                     ];
//
//                     if ($item->user_id) {
//                         $tmpData['author'] = [
//                             'id'         => $item->user_id,
//                             'name'       => $item->user_name,
//                             'level'      => (int) $item->user_level,
//                             'reputation' => (int) $item->user_reputation,
//                             'avatar'     => $item->user_avatar
//                         ];
//                     }
//
//                     $result[] = $tmpData;
//                }
//            }
//
//            return $this->respond([
//                'items'   => $result,
//                'count'   => count($result),
//                'canVote' => !in_array($session->id, array_column($result, 'session'))
//            ]);
//        } catch (Exception $e) {
//            log_message('error', '{exception}', ['exception' => $e]);
//
//            return $this->failNotFound();
//        }
//    }

    /**
     * Adding a new rating
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function set(): ResponseInterface {
        try {
            $input = $this->request->getJSON();

            if (empty($input) || !$input->place || !$input->score) {
                return $this->failValidationErrors();
            }

            $session     = new Session();
            $ratingModel = new RatingModel();
            $placesModel = new PlacesModel();
            $usersModel  = new UsersModel();
            $placesData  = $placesModel->select('id, user_id, rating, updated_at')->find($input->place);
            $usersData   = $usersModel->select('id, reputation, updated_at')->find($placesData->user_id);

            if (!$placesData) {
                return $this->failNotFound();
            }

            $ratingValue = (int) $input->score <= -1 ? -1 : 1;
            $placeRating = $placesData->rating + $ratingValue;

            $rating = new \App\Entities\Rating();
            $rating->place_id   = $input->place;
            $rating->user_id    = isset($session->userData) ? $session->userData->id : null;
            $rating->session_id = $session->id;
            $rating->value      = $ratingValue;

            $usersModel->update($placesData->user_id, ['reputation' => $usersData->reputation + $ratingValue, 'updated_at' => $usersData->updated_at]);
            $placesModel->update($placesData->id, ['rating' => $placeRating, 'updated_at' => $placesData->updated_at]);
            $ratingModel->insert($rating);

            /* ACTIVITY */
            if ($session->isAuth) {
                $userActivity = new UserActivity();
                $userActivity->rating($placesData->id, $ratingModel->getInsertID());
            }

            /* NOTIFICATIONS */
            // If a user gives a rating to a material that is not his own,
            // we will send a notification to the author of the material about the change in the rating of his place
            $userNotify = new UserNotify();
            if (!$session->isAuth || $placesData->user_id !== $session->userData->id) {
                $userNotify->rating($placesData->user_id, $placesData->id);
            }

            return $this->respond((object) ['rating' => $placeRating]);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}