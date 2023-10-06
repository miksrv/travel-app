<?php namespace App\Controllers;

use App\Models\UsersActivityModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Activity extends ResourceController
{
    /**
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
            ->orderBy('users_activity.created_at')
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