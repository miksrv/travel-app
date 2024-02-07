<?php namespace App\Controllers;

use App\Libraries\PlacesContent;
use App\Libraries\SessionLibrary;
use App\Models\PlacesModel;
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
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 10;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $notifyModel = new UsersNotificationsModel();
        $notifyData  = $notifyModel
            ->select('users_notifications.*, activity.type as activity_type, activity.place_id')
            ->join('activity', 'activity.id = users_notifications.activity_id', 'left')
            ->where('read', false)
            ->where('users_notifications.user_id', $session->user->id)
            ->where('users_notifications.created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)')
            ->orderBy('read, created_at', 'DESC')
            ->findAll($limit, $offset);

        $notifyCount = $notifyModel
            ->select('id')
            ->where('users_notifications.user_id', $session->user->id)
            ->countAllResults();

        if (!$notifyData) {
            return $this->respond([
                'items' => $result,
                'count' => $notifyCount
            ]);
        }
        $placeContent = new PlacesContent(350);
        $placesModel  = new PlacesModel();
        $placesData = [];
        $placesIds  = [];

        foreach ($notifyData as $notify) {
            if ($notify->place_id && $notify->type !== 'level' && $notify->type !== 'achievements') {
                $placesIds[] = $notify->place_id;
            }
        }

        if ($placesIds) {
            $placesData = $placesModel->select('id, photos')->whereIn('id', $placesIds)->findAll();
            $placeContent->translate($placesIds);
        }

        foreach ($notifyData as $notify) {
            $findPlace = array_search($notify->place_id, array_column($placesData, 'id'));
            $placeData = $findPlace !== false ? $placesData[$findPlace] : null;
            $result[]  = [
                'id'       => $notify->id,
                'type'     => $notify->type,
                'activity' => $notify->activity_type,
                'meta'     => $notify->meta,
                'place'    => $placeData ? [
                    'id'    => $placeData->id,
                    'title' => $placeContent->title($placeData->id),
                    'cover' => $placeData->photos && file_exists(UPLOAD_PHOTOS . $placeData->id . '/cover.jpg') ? [
                        'preview' => PATH_PHOTOS . $placeData->id . '/cover_preview.jpg',
                    ] : null
                ] : null
            ];
        }

        // Update all showed notifications
        $notifyModel
            ->set('read', true)
            ->where('read', false)
            ->where('users_notifications.user_id', $session->user->id)
            ->where('users_notifications.created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)')
            ->update();

        return $this->respond([
            'items' => $result,
            'count' => $notifyCount
        ]);
    }
}