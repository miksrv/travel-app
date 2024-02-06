<?php namespace App\Controllers;

use App\Libraries\SessionLibrary;
use App\Models\UsersNotificationsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Notifications extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $session = new SessionLibrary();

        // The list of notifications is available only for the current user.
        // The user will not be able to view the list of notifications for another user.
        if (!$session->isAuth || !$session->user?->id) {
            return $this->respond(['result' => false]);
        }

        $result = [];
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 40;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        // Мы должны сразу обновить все сообщения в read ==== 1

        $notifyModel = new UsersNotificationsModel();
        $notifyData  = $notifyModel
            ->select('users_notifications.*, activity.type as activity_type')
            ->join('activity', 'activity.id = users_notifications.activity_id', 'left')
            ->where('users_notifications.user_id', $session->user->id)
            ->orderBy('read, created_at', 'DESC')
            ->findAll($limit, $offset);

        if (!$notifyData) {
            return $this->respond([
                'items' => $result
            ]);
        }

        foreach ($notifyData as $notify) {
            $result[] = [
                'id'       => $notify->id,
                'type'     => $notify->type,
                'activity' => $notify->activity_type,
                'meta'     => $notify->meta,
            ];
        }

        return $this->respond([
            'items' => $result
        ]);
    }
}