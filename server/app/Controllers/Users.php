<?php namespace App\Controllers;

use App\Libraries\UserLevels;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\SessionsModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Users extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 40;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $usersModel = new UsersModel();
        $usersData  = $usersModel
            ->select('id, name, avatar, created_at')
            ->orderBy('reputation', 'DESC')
            ->findAll($limit, $offset);

        $result = [];

        if (empty($usersData)) {
            return $this->respond([
                'items' => $result,
                'count' => 0
            ]);
        }

        foreach ($usersData as $item) {
            $result[] = (object) [
                'id'      => $item->id,
                'name'    => $item->name,
                'avatar'  => $item->avatar,
                'created' => $item->created_at
            ];
        }

        return $this->respond([
            'items' => $result,
            'count' => $usersModel->select('id')->countAllResults()
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        $usersModel   = new UsersModel();
        $sessionModel = new SessionsModel();
        $sessionData  = $sessionModel->where('user_id', $id)->first();
        $usersData    = $usersModel
            ->select('id, name, level, experience, reputation, website, avatar, created_at, updated_at')
            ->find($id);

        // GET ALL USER REPUTATION
        $placesModel = new PlacesModel();
        $placesData  = $placesModel->select('id')->where('author', $id)->findAll();
        $ratingValue = $usersData->reputation;

        if ($placesData) {
            $ratingModel = new RatingModel();
            $placesIds   = [];

            foreach ($placesData as $place) {
                $placesIds[] = $place->id;
            }

            $ratingDataPlus  = $ratingModel->selectSum('value')->where('value >', 2)->whereIn('place', $placesIds)->first();
            $ratingDataMinus = $ratingModel->selectSum('value')->where('value <=', 2)->whereIn('place', $placesIds)->first();
            $ratingValue = $ratingDataPlus->value - $ratingDataMinus->value;
        }

        $userLevels = new UserLevels($usersData);
        $userLevels->calculate();

        if (!$usersData) {
            return $this->failNotFound();
        }

        $result = (object) [
            'id'         => $usersData->id,
            'name'       => $usersData->name,
            'avatar'     => $usersData->avatar,
            'level'      => $userLevels->data,
            'reputation' => $ratingValue,
            'website'    => $usersData->website,
            'created'    => $usersData->created_at,
            'updated'    => $usersData->updated_at
        ];

        if ($sessionData && $sessionData->updated_at) {
            $result->activity = $sessionData->updated_at;
        }

        return $this->respond($result);
    }
}