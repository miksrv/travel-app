<?php namespace App\Controllers;

use App\Models\UsersActivityModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

/**
 * User activity controller
 * Show all user activity such as places, photos and rating
 *
 * GET / -> activity()
 * GET /show/{id} -> show($id)
 */
class Activity extends ResourceController
{

    /**
     * Show all activities for all users and all places, photos
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $activityModel = new UsersActivityModel();
        $activityData  = $activityModel
            ->select(
                'users_activity.*, places.id as place_id, users.id as user_id, users.name as user_name,
                users.avatar as user_avatar, translations_places.title, 
                SUBSTRING(translations_places.content, 1, 350) as content, photos.filename, photos.extension, 
                photos.filesize, photos.width, photos.height')
            ->join('translations_places', 'users_activity.place = translations_places.place AND language = "ru"')
            ->join('places', 'users_activity.place = places.id', 'left')
            ->join('photos', 'users_activity.photo = photos.id', 'left')
            ->join('users', 'users_activity.user = users.id', 'left')
            ->whereIn('users_activity.type', ['photo', 'place'])
            ->orderBy('users_activity.created_at', 'DESC')
            ->limit(80)
            ->get()
            ->getResult();

        $groupData = [];

        if (!empty($activityData)) {
            foreach ($activityData as $item) {
                $lastGroup = end($groupData);
                $itemPhoto = $item->type === 'photo' && $item->filename ? [
                    'filename'  => $item->filename,
                    'extension' => $item->extension,
                    'width'     => (int) $item->width,
                    'height'    => (int) $item->height
                ] : null;

                // Группируем активность по фотографиям одного пользователя, загруженных для
                // одного места и с разницей не больше 5 минут
                if (
                    $item->type === 'photo' &&
                    $lastGroup &&
                    $lastGroup->place->id === $item->place &&
                    $lastGroup->author->id === $item->user &&
                    (strtotime($lastGroup->created) - strtotime($item->created_at)) <= 300
                ) {
                    $lastGroup->created  = $item->created_at; // Каждый раз обновляем время загрузки последней фотографии
                    $lastGroup->photos[] = $itemPhoto;

                    continue;
                }

                $currentGroup = (object) [
                    'type'    => $item->type,
                    'created' => $item->created_at,
                    'author'  => (object) [
                        'id'     => $item->user_id,
                        'name'   => $item->user_name,
                        'avatar' => $item->user_avatar
                    ],
                    'place'   => (object) [
                        'id'        => $item->place,
                        'title'     => strip_tags(html_entity_decode($item->title)),
                        'content'   => strip_tags(html_entity_decode($item->content)),
                    ],
                    'photos'  => []
                ];

                if ($item->type === 'photo') {
                    $currentGroup->photos[] = $itemPhoto;
                }

                $groupData[] = $currentGroup;
            }

        }
    
        return $this->respond([
            'items'  => $groupData
        ]);
    }

    /**
     * Show all activities for place by ID
     * @param $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        $activityModel = new UsersActivityModel();
        $activityData  = $activityModel
            ->select(
                'users_activity.*, users.id as user_id, users.name as user_name, rating.value, users.avatar as user_avatar,
                photos.filename, photos.extension, photos.filesize, photos.width, photos.height')
            ->join('rating', 'users_activity.rating = rating.id', 'left')
            ->join('photos', 'users_activity.photo = photos.id', 'left')
            ->join('users', 'users_activity.user = users.id', 'left')
            ->where('users_activity.place', $id)
            ->orderBy('users_activity.created_at', 'DESC')
            ->findAll();

        $result = [];

        if (!empty($activityData)) {
            foreach ($activityData as $item) {
                $tmpData = [
                    'created' => $item->created_at,
                    'type'   => $item->type
                ];

                if ($item->rating) {
                    $tmpData['rating'] = [
                        'value' => (int) $item->value
                    ];
                }

                if ($item->filename) {
                    $tmpData['photo'] = [
                        'filename'  => $item->filename,
                        'extension' => $item->extension,
                        'filesize'  => (int) $item->filesize,
                        'width'     => (int) $item->width,
                        'height'    => (int) $item->height
                    ];
                }

                if ($item->user_id) {
                    $tmpData['author'] = [
                        'id'     => $item->user_id,
                        'name'   => $item->user_name,
                        'avatar' => $item->user_avatar
                    ];
                }

                $result[] = $tmpData;
            }
        }

        return $this->respond([
            'items'  => $result
        ]);
    }
}