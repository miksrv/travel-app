<?php namespace App\Controllers;

use App\Libraries\Session;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Notifications extends ResourceController {
    /**
     * @param null $id
     * @return ResponseInterface
     */
    public function list($id = null): ResponseInterface {
        $session = new Session();

        // The list of notifications is available only for the current user.
        // The user will not be able to view the list of notifications for another user.
        if (!$session->isAuth || $session->userData->id !== $id) {
            return $this->respond(['result' => false]);
        }

        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 40;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $notifyModel = new UsersNotifications();
        $notifyData  = $notifyModel
            ->where('user_id', $id)
            ->orderBy('read, created_at', 'DESC')
            ->findAll($limit, $offset);

        return $this->respond([
            'items' => $notifyData
        ]);
    }
}