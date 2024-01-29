<?php namespace App\Controllers;

use App\Libraries\UserLevels;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Exception;
use ReflectionException;

class Users extends ResourceController {
    /**
     * @return ResponseInterface
     * @throws Exception
     */
    public function list(): ResponseInterface {
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 40;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $userLevels = new UserLevels();
        $usersModel = new UsersModel();
        $usersData  = $usersModel
            ->select(
                'users.id, users.name, users.avatar, users.created_at, users.updated_at, users.level, 
                users.experience, users.reputation, sessions.updated_at as user_activity')
            ->join('sessions', 'users.id = sessions.user_id', 'left')
            ->orderBy('user_activity, users.updated_at', 'DESC')
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
                    'title'      => $level->title,
                    'experience' => $item->experience,
                    'nextLevel'  => $level->nextLevel,
                ],
                'reputation' => $item->reputation,
                'created'    => $item->created_at,
                'activity'   => $item->user_activity ? new \DateTime($item->user_activity) : null
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
     * @throws Exception
     */
    public function show($id = null): ResponseInterface {
        $userLevels = new UserLevels();
        $usersModel = new UsersModel();
        $usersData  = $usersModel
            ->select(
                'users.id, users.name, users.avatar, users.created_at,  users.updated_at, users.level, 
                users.website, users.experience, users.reputation, sessions.updated_at as user_activity')
            ->join('sessions', 'users.id = sessions.user_id', 'left')
            ->find($id);

        if (!$usersData) {
            return $this->failNotFound();
        }

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
            $ratingValue     = $ratingDataPlus->value - $ratingDataMinus->value;

            if ($ratingValue !== $usersData->reputation) {
                $usersModel->update($usersData->id, ['reputation' => $ratingValue]);
            }
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
            'updated'    => $usersData->updated_at,
            'activity'   => $usersData->user_activity ? new \DateTime($usersData->user_activity) : null
        ];

        return $this->respond($result);
    }
}