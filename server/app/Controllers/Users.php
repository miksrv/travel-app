<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Libraries\LevelsLibrary;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Exception;
use ReflectionException;

class Users extends ResourceController {
    public function __construct() {
        new LocaleLibrary();
    }

    /**
     * @return ResponseInterface
     * @throws Exception
     */
    public function list(): ResponseInterface {
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 40;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $userLevels = new LevelsLibrary();
        $usersModel = new UsersModel();
        $usersData  = $usersModel
            ->select('id, name, avatar, created_at, activity_at, updated_at, level, experience, reputation')
            ->orderBy('activity_at, updated_at', 'DESC')
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
            $avatar   = $item->avatar ? explode('.', $item->avatar) : null;
            $result[] = (object) [
                'id'     => $item->id,
                'name'   => $item->name,
                'avatar' => $avatar
                    ? PATH_AVATARS . $item->id . '/' . $avatar[0] . '_preview.' . $avatar[1]
                    : null,
                'level'  => [
                    'level'      => $level->level,
                    'title'      => $level->title,
                    'experience' => $item->experience,
                    'nextLevel'  => $level->nextLevel,
                ],
                'reputation' => $item->reputation,
                'created'    => $item->created_at,
                'activity'   => $item->activity_at ? new \DateTime($item->activity_at) : null
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
        $userLevels = new LevelsLibrary();
        $usersModel = new UsersModel();
        $usersData  = $usersModel
            ->select('id, name, avatar, created_at, updated_at, activity_at, level, website, experience, reputation')
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

            $ratingDataPlus  = $ratingModel->selectCount('value')->where('value >', 2)->whereIn('place_id', $placesIds)->first();
            $ratingDataMinus = $ratingModel->selectCount('value')->where('value <=', 2)->whereIn('place_id', $placesIds)->first();
            $ratingValue     = $ratingDataPlus->value - $ratingDataMinus->value;

            if ($ratingValue !== $usersData->reputation) {
                $usersModel->update($usersData->id, ['reputation' => $ratingValue]);
            }
        }

        $result = (object) [
            'id'         => $usersData->id,
            'name'       => $usersData->name,
            'level'      => $userLevels->getLevelData($usersData),
            'statistic'  => $userLevels->statistic,
            'reputation' => $ratingValue,
            'website'    => $usersData->website,
            'created'    => $usersData->created_at,
            'updated'    => $usersData->updated_at,
            'activity'   => $usersData->activity_at ? new \DateTime($usersData->activity_at) : null,
            'avatar'     => $usersData->avatar
                ? PATH_AVATARS . $usersData->id . '/' . $usersData->avatar
                : null
        ];

        return $this->respond($result);
    }
}