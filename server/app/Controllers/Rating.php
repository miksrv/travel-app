<?php namespace App\Controllers;

use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\SessionsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Rating extends ResourceController
{
    public function show($id = null): ResponseInterface {
        try {
            $ratingModel = new RatingModel();
            $ratingData  = $ratingModel
                ->select(
                    'rating.*, users.id as user_id, users.name as user_name,' .
                    'users.level as user_level, users.reputation as user_reputation, users.avatar as user_avatar')
                ->join('users', 'rating.author = users.id', 'left')
                ->where(['place' => $id])
                ->findAll();

            $result = [];

            if (!empty($ratingData)) {
                foreach ($ratingData as $item) {
                     $tmpData = [
                         'created' => $item->created_at,
                         'session' => $item->session,
                         'value'   => $item->value
                     ];

                     if ($item->user_id) {
                         $tmpData['author'] = [
                             'id'         => $item->user_id,
                             'name'       => $item->user_name,
                             'level'      => (int) $item->user_level,
                             'reputation' => (int) $item->user_reputation,
                             'avatar'     => $item->user_avatar
                         ];
                     }

                     $result[] = $tmpData;
                }
            }

            return $this->respond([
                'items' => $result,
                'count' => count($result)]
            );
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }

    public function set(): ResponseInterface {
        try {
            $inputJSON = $this->request->getJSON();

            if (empty($inputJSON) || !$inputJSON->place || !$inputJSON->score)
            {
                return $this->failValidationErrors();
            }

            $ratingModel = new RatingModel();
            $placesModel = new PlacesModel();
            $placesData  = $placesModel->find($inputJSON->place);

            if (!$placesData) {
                return $this->failNotFound();
            }

            $ip = $this->request->getIPAddress();
            $ua = $this->request->getUserAgent();

            $sessionModel = new SessionsModel();
            $findSession  = $sessionModel->where([
                'ip'         => $ip,
                'user_agent' => $ua->getAgentString()
            ])->first();

            $newScore = (int) $inputJSON->score < 1
                ? 1
                : ((int) $inputJSON->score > 5
                    ? 5
                    : (int) $inputJSON->score);

            $insertRating = [
                'place'   => $inputJSON->place,
                'author'  => null,
                'session' => $findSession->id ?? null,
                'value'   => $newScore,
            ];

            $placeRating  = $ratingModel->where('place', $placesData->id)->findAll();
            $averageValue = 0;

            if ($placeRating) {
                foreach ($placeRating as $item) {
                    $averageValue += $item->value;
                }
            }

            $newPlaceVal = round(($averageValue + $newScore) / (count($placeRating) + 1), 0);

            $placesModel->update($placesData->id, ['rating' => $newPlaceVal]);
            $ratingModel->insert($insertRating);

            return $this->respond((object) ['rating' => $newPlaceVal]);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}