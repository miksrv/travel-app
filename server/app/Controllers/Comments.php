<?php namespace App\Controllers;

use App\Libraries\SessionLibrary;
use App\Models\CommentsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Exception;

class Comments extends ResourceController {

    protected $model;

    public function __construct() {
        $this->model   = new CommentsModel();
        $this->session = new SessionLibrary();
    }

    /**
     * @return ResponseInterface
     * @throws Exception
     */
    public function list(): ResponseInterface {
        $place = $this->request->getGet('place', FILTER_SANITIZE_SPECIAL_CHARS);
        $data  = $this->model
            ->select('comments.*, users.id as user_id, users.name as user_name, users.avatar as user_avatar')
            ->join('users', 'comments.user_id = users.id', 'left')
            ->where('place_id', $place)
            ->orderBy('created_at', 'DESC')
            ->findAll();

        if (empty($data)) {
            return $this->respond(['items' => [], 'count' => 0]);
        }

        foreach ($data as $comment) {
            $avatar = $comment->user_avatar ? explode('.', $comment->user_avatar) : null;

            $comment->placeId  = $comment->place_id;
            $comment->answerId = $comment->answer_id;
            $comment->created = $comment->created_at;
            $comment->author  = [
                'id'     => $comment->user_id,
                'name'   => $comment->user_name,
                'avatar' => $avatar
                    ? PATH_AVATARS . $comment->user_id . '/' . $avatar[0] . '_small.' . $avatar[1]
                    : null
            ];

            unset(
                $comment->place_id, $comment->answer_id, $comment->user_id,
                $comment->user_name, $comment->user_avatar, $comment->created_at
            );
        }

        return $this->respond(['items' => $data, 'count' => count($data)]);
    }
}