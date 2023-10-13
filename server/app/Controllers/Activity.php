<?php namespace App\Controllers;

use App\Libraries\PlaceTranslation;
use App\Models\CategoryModel;
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
class Activity extends ResourceController {

    /**
     * Show all activities for all users and all places, photos
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $lastDate = $this->request->getGet('date', FILTER_SANITIZE_STRING);

        // Load translate library
        $placeTranslations = new PlaceTranslation('ru', 350);

        $categoriesModel = new CategoryModel();
        $categoriesData  = $categoriesModel->findAll();

        $activityModel = new UsersActivityModel();
        $activityModel
            ->select(
                'users_activity.*, places.id as place_id, places.category, users.id as user_id, users.name as user_name,
                users.avatar as user_avatar, photos.filename, photos.extension, photos.width, photos.height')
            ->join('places', 'users_activity.place = places.id', 'left')
            ->join('photos', 'users_activity.photo = photos.id', 'left')
            ->join('users', 'users_activity.user = users.id', 'left');

        if ($lastDate) {
            $activityModel->where('users_activity.created_at < ', $lastDate);
        }

        $activityData = $activityModel
            ->whereIn('users_activity.type', ['photo', 'place'])
            ->orderBy('users_activity.created_at, users_activity.type', 'DESC')
            ->findAll(20);

        $placesIds = [];

        foreach ($activityData as $item) {
            $placesIds[] = $item->place_id;
        }

        $placeTranslations->translate($placesIds);

        $response = $this->_groupSimilarActivities($activityData, $categoriesData, $placeTranslations);

        // Удаляем последнией объект в массиве, потому что он может быть сгруппирован не полностью
        array_pop($response);

        return $this->respond(['items'  => $response]);
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

        return $this->respond([
            'items'  => $this->_groupSimilarActivities($activityData)
        ]);
    }

    /**
     * Группироуем похожие активности пользователей. Например, загруженные фотографии одного пользователя
     * для одного места с интервалом 5 минут - объединяем в одну активность
     * @param array $activityData
     * @param PlaceTranslation|null $placeTranslations
     * @param array|null $categoriesData
     * @return array
     */
    protected function _groupSimilarActivities(
        array $activityData,
        array $categoriesData = null,
        PlaceTranslation $placeTranslations = null
    ): array {
        $groupData = [];

        if (empty($activityData)) {
            return $groupData;
        }

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
                $lastGroup &&
                $item->type === 'photo' &&
                $lastGroup->type === 'photo' &&
                (!isset($lastGroup->place) || $lastGroup->place->id === $item->place) &&
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
                'photos'  => []
            ];

            if ($placeTranslations && $categoriesData) {
                $findCategory = array_search($item->category, array_column($categoriesData, 'name'));

                $currentGroup->place = (object) [
                    'id'       => $item->place,
                    'title'    => $placeTranslations->title($item->place),
                    'content'  => $placeTranslations->content($item->place),
                    'category' => (object) [
                        'name'  => $categoriesData[$findCategory]->name,
                        'title' => $categoriesData[$findCategory]->title,
                    ]
                ];
            }

            if ($item->user_id) {
                $currentGroup->author = (object) [
                    'id'     => $item->user_id,
                    'name'   => $item->user_name,
                    'avatar' => $item->user_avatar
                ];
            }

            if ($item->type === 'photo') {
                $currentGroup->photos[] = $itemPhoto;
            }

            if ($item->type === 'rating') {
                $currentGroup->rating = (object) [
                    'value' => $item->value
                ];
            }

            $groupData[] = $currentGroup;
        }

        return $groupData;
    }
}