<?php namespace App\Controllers;

use App\Libraries\PlacesContent;
use App\Models\CategoryModel;
use App\Models\ActivityModel;
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
        $lastDate = $this->request->getGet('date', FILTER_SANITIZE_SPECIAL_CHARS);
        $limit    = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 20;
        $offset   = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;
        $author   = $this->request->getGet('author', FILTER_SANITIZE_SPECIAL_CHARS);
        $place    = $this->request->getGet('place', FILTER_SANITIZE_SPECIAL_CHARS);

        // Load translate library
        $placeTranslations = new PlacesContent('ru', 400);

        $categoriesModel = new CategoryModel();
        $categoriesData  = $categoriesModel->findAll();

        $activityModel = new ActivityModel();
        $activityModel
            ->select(
                'activity.*, places.id as place_id, places.category, users.id as user_id, users.name as user_name,
                users.avatar as user_avatar, photos.filename, photos.extension, photos.width, photos.height')
            ->join('places', 'activity.place_id = places.id', 'left')
            ->join('photos', 'activity.photo_id = photos.id', 'left')
            ->join('users', 'activity.user_id = users.id', 'left');

        if ($lastDate) {
            $activityModel->where('activity.created_at < ', $lastDate);
        }

        if ($author) {
            $activityModel->where('activity.user_id', $author);
        }

        if ($place) {
            $activityModel->where('activity.place_id', $place);
        }

        $activityData = $activityModel
            ->whereIn('activity.type', ['photo', 'place', 'edit'])
            ->orderBy('activity.created_at, activity.type', 'DESC')
            ->findAll(abs($limit), abs($offset));

        $placesIds = [];

        foreach ($activityData as $item) {
            $placesIds[] = $item->place_id;
        }

        $placeTranslations->translate($placesIds, true);

        $response = $this->_groupSimilarActivities(
            $activityData,
            $categoriesData,
            $placeTranslations
        );

        // We remove the last object in the array because it may not be completely grouped
        if (!$author && !$place) {
            array_pop($response);
        }

        return $this->respond([
            'items' => $response
        ]);
    }

    /**
     * We group similar user activities. For example, uploaded photos of one user
     * for one place with an interval of 5 minutes - we combine them into one activity
     * @param array $activityData
     * @param array|null $categoriesData
     * @param PlacesContent|null $placeTranslations
     * @return array
     */
    protected function _groupSimilarActivities(
        array $activityData,
        array $categoriesData = null,
        PlacesContent $placeTranslations = null
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
                'height'    => (int) $item->height,
                'placeId'   => $item->place_id
            ] : null;

            // We group activity by photos of one user, uploaded for one place and with a difference of no more than 5 minutes
            if (
                $lastGroup &&
                $item->type === 'photo' &&
                $lastGroup->type === 'photo' &&
                (!isset($lastGroup->place) || $lastGroup->place->id === $item->place_id) &&
                $lastGroup->author->id === $item->user_id &&
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
                    'id'         => $item->place_id,
                    'title'      => $placeTranslations->get($item->place_id, 'title', $item->created_at),
                    'content'    => $placeTranslations->get($item->place_id, 'content', $item->created_at),
                    'difference' => (int) $placeTranslations->get($item->place_id, 'delta', $item->created_at),
                    'category'   => (object) [
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