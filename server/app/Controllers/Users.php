<?php namespace App\Controllers;

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
        $sessionData  = $sessionModel->where('user', $id)->first();
        $usersData    = $usersModel
            ->select('id, name, avatar, created_at, updated_at')
            ->find($id);

        if (!$usersData) {
            return $this->failNotFound();
        }

        $result = (object) [
            'id'      => $usersData->id,
            'name'    => $usersData->name,
            'avatar'  => $usersData->avatar,
            'created' => $usersData->created_at,
            'updated' => $usersData->updated_at
        ];

        if ($sessionData && $sessionData->updated_at) {
            $result->activity = $sessionData->updated_at;
        }

        return $this->respond($result);
    }
}