<?php namespace App\Controllers;

use App\Libraries\PlacesContent;
use App\Libraries\SessionLibrary;
use App\Models\PlacesModel;
use App\Models\UsersNotificationsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Notifications extends ResourceController {
    private SessionLibrary $session;

    protected $model;

    public function __construct() {
        $this->session = new SessionLibrary();
        $this->model   = new UsersNotificationsModel();

        // The list of notifications is available only for the current user.
        // The user will not be able to view the list of notifications for another user.
        if (!$this->session->isAuth || !$this->session->user?->id) {
            return $this->failUnauthorized();
        }
    }

    /**
     * We get a list of notifications that were added in the last 15 minutes and that have not yet been read,
     * such notifications will be shown to the user in Snackbar
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function updates(): ResponseInterface {
        $result = [];
        $notifyData  = $this->model
            ->select('users_notifications.*, activity.type as activity_type, activity.place_id')
            ->join('activity', 'activity.id = users_notifications.activity_id', 'left')
            ->where('read', false)
            ->where('users_notifications.user_id', $this->session->user->id)
            ->where('users_notifications.created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)')
            ->orderBy('read, created_at', 'DESC')
            ->findAll(10);

        $notifyCount = $this->model
            ->select('id')
            ->where('read', false)
            ->where('users_notifications.user_id', $this->session->user->id)
            ->where('users_notifications.created_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)')
            ->countAllResults();

        if (!$notifyData) {
            return $this->respond([
                'items' => $result,
                'count' => $notifyCount
            ]);
        }

        return $this->respond([
            'items' => $this->_formatNotifyList($notifyData),
            'count' => $notifyCount
        ]);
    }

    /**
     * We get a page-by-page list of all notifications of the current user
     */
    public function list(): ResponseInterface {
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 10;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $notifyData = $this->model
            ->select('users_notifications.*, activity.type as activity_type, activity.place_id')
            ->join('activity', 'activity.id = users_notifications.activity_id', 'left')
            ->where('users_notifications.user_id', $this->session->user->id)
            ->orderBy('created_at', 'DESC')
            ->findAll($limit, $offset);

        $notifyCount = $this->model
            ->select('id')
            ->where('users_notifications.user_id', $this->session->user->id)
            ->countAllResults();

        if (!$notifyData) {
            return $this->respond([
                'items' => [],
                'count' => $notifyCount
            ]);
        }

        return $this->respond([
            'items' => $this->_formatNotifyList($notifyData),
            'count' => $notifyCount
        ]);
    }

    /**
     * Delete all notifications for the current user
     * @return void
     */
    public function clear(): void {
        $this->model
            ->where('users_notifications.user_id', $this->session->user->id)
            ->delete();
    }

    /**
     * We format the list of notifications and return the result as an array of objects.
     * All unread notifications are immediately marked as read.
     *
     * @param array $notifyData
     * @return array
     * @throws ReflectionException
     */
    private function _formatNotifyList(array $notifyData): array {
        if (empty($notifyData)) {
            return [];
        }

        $placeContent = new PlacesContent(350);
        $placesData = [];
        $placesIds  = [];
        $result     = [];
        $unread     = [];

        // In the adjacent activity table we will collect ID place, if the current notification is about a change in content
        foreach ($notifyData as $notify) {
            if ($notify->place_id && $notify->type !== 'level' && $notify->type !== 'achievements') {
                $placesIds[] = $notify->place_id;
            }
        }

        // If we have collected IDs of places, we will get information about them from the database and download translations
        if ($placesIds) {
            $placesModel = new PlacesModel();
            $placesData  = $placesModel->select('id, photos')->whereIn('id', $placesIds)->findAll();
            $placeContent->translate($placesIds);
        }

        foreach ($notifyData as $notify) {
            // If the notification has not been read, add its ID to the array of unread notifications
            if (!$notify->read) {
                $unread[] = $notify->id;
            }

            $findPlace = array_search($notify->place_id, array_column($placesData, 'id'));
            $placeData = $findPlace !== false ? $placesData[$findPlace] : null;
            $tempData  = [
                'id'       => $notify->id,
                'type'     => $notify->type,
                'activity' => $notify->activity_type,
                'meta'     => $notify->meta
            ];

            if (isset($notify->created_at)) {
                $tempData['created'] = $notify->created_at;
            }

            if (isset($notify->read)) {
                $tempData['read'] = $notify->read;
            }

            if ($placeData && $placeData->id) {
                $tempData['place'] = [
                    'id'    => $placeData->id,
                    'title' => $placeContent->title($placeData->id),
                    'cover' => $placeData->photos && file_exists(UPLOAD_PHOTOS . $placeData->id . '/cover.jpg') ? [
                        'preview' => PATH_PHOTOS . $placeData->id . '/cover_preview.jpg',
                    ] : null
                ];
            }

            $result[] = $tempData;
        }

        // If our array of unread notifications is not empty, then we will mark all such notifications as read
        if (!empty($unread)) {
            $this->model
                ->set('read', true)
                ->where('read', false)
                ->where('users_notifications.user_id', $this->session->user->id)
                ->whereIn('id', $unread)
                ->update();
        }

        return $result;
    }
}