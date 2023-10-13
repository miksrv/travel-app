<?php namespace App\Controllers;

use App\Libraries\Session;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\UsersActivityModel;
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
     * Добавление новой оценки
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function set(): ResponseInterface {
        try {
            $inputJSON = $this->request->getJSON();

            if (empty($inputJSON) || !$inputJSON->place || !$inputJSON->score)
            {
                return $this->failValidationErrors();
            }

            $session     = new Session();
            $ratingModel = new RatingModel();
            $placesModel = new PlacesModel();
            $placesData  = $placesModel->find($inputJSON->place);

            if (!$placesData) {
                return $this->failNotFound();
            }

            $newScore = (int) $inputJSON->score < 1
                ? 1
                : min((int)$inputJSON->score, 5);

            $insertRating = [
                'place'   => $inputJSON->place,
                'author'  => null,
                'session' => $session->id,
                'value'   => $newScore,
            ];

            $placeRating  = $ratingModel->where('place', $placesData->id)->findAll();
            $averageValue = 0;

            if (in_array($session->id, array_column($placeRating, 'session'))) {
                return $this->failValidationErrors('The user has already voted for this material');
            }

            if ($placeRating) {
                foreach ($placeRating as $item) {
                    $averageValue += $item->value;
                }
            }

            $newPlaceVal = round(($averageValue + $newScore) / (count($placeRating) + 1), 1);

            $placesModel->update($placesData->id, ['rating' => $newPlaceVal]);
            $ratingModel->insert($insertRating);

            $activityModel = new UsersActivityModel();
            $activityModel->insert([
                'type'   => 'rating',
                'place'  => $placesData->id,
                'rating' => $ratingModel->getInsertID()
            ]);

            return $this->respond((object) ['rating' => $newPlaceVal]);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}