<?php namespace App\Controllers;

use App\Models\RatingModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');

if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
    die();
}

class Rating extends ResourceController
{
    public function show($id = null): ResponseInterface {
        try {
            $ratingModel = new RatingModel();
            $ratingData  = $ratingModel
                ->select('rating.*, users.*, users.id as user_id')
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
}