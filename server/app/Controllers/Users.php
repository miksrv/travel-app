<?php namespace App\Controllers;

use App\Libraries\UserLevels;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\SessionsModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Users extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 40;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $userLevels = new UserLevels();
        $usersModel = new UsersModel();
        $usersData  = $usersModel
            ->select('id, name, avatar, created_at, level, experience, reputation')
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
            $level    = $userLevels->getLevelData($item);
            $result[] = (object) [
                'id'      => $item->id,
                'name'    => $item->name,
                'avatar'  => $item->avatar,
                'level'   => [
                    'level'      => $level->level,
                    'name'       => $level->name,
                    'experience' => $item->experience,
                    'nextLevel'  => $level->nextLevel,
                ],
                'created' => $item->created_at,
                'reputation' => $item->reputation,
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
     * @throws ReflectionException
     */
    public function show($id = null): ResponseInterface {
        $userLevels   = new UserLevels();
        $usersModel   = new UsersModel();
        $sessionModel = new SessionsModel();
        $sessionData  = $sessionModel->where('user_id', $id)->first();
        $usersData    = $usersModel
            ->select('id, name, level, experience, reputation, website, avatar, created_at, updated_at')
            ->find($id);

        // GET ALL USER REPUTATION
        $placesModel = new PlacesModel();
        $placesData  = $placesModel->select('id')->where('user_id', $id)->findAll();
        $ratingValue = $usersData->reputation;

        $userLevels->calculate($usersData);

        // Calculate new user reputation value
        if ($placesData) {
            $ratingModel = new RatingModel();
            $placesIds   = [];

            foreach ($placesData as $place) {
                $placesIds[] = $place->id;
            }

            $ratingDataPlus  = $ratingModel->selectSum('value')->where('value >', 2)->whereIn('place_id', $placesIds)->first();
            $ratingDataMinus = $ratingModel->selectSum('value')->where('value <=', 2)->whereIn('place_id', $placesIds)->first();
            $ratingValue = $ratingDataPlus->value - $ratingDataMinus->value;
        }

        if (!$usersData) {
            return $this->failNotFound();
        }

        $result = (object) [
            'id'         => $usersData->id,
            'name'       => $usersData->name,
            'avatar'     => $usersData->avatar,
            'level'      => $userLevels->getLevelData($usersData),
            'statistic'  => $userLevels->statistic,
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