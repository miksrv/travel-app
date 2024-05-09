<?php namespace App\Controllers;

use App\Libraries\PlacesContent;
use App\Models\CategoryModel;
use App\Models\ActivityModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

/**
 * User activity controller
 * Show all user activity such as places, photos and rating
 */
class Activity extends ResourceController {
    /**
     * Show all activities for all users and all places, photos
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $lastDate = $this->request->getGet('date', FILTER_SANITIZE_SPECIAL_CHARS);
        $limit    = abs($this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 20);
        $offset   = abs($this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0);
        $author   = $this->request->getGet('author', FILTER_SANITIZE_SPECIAL_CHARS);
        $place    = $this->request->getGet('place', FILTER_SANITIZE_SPECIAL_CHARS);

        $placeContent  = new PlacesContent();
        $activityModel = new ActivityModel();
        $activityData  = $activityModel->getActivityList($lastDate, $author, $place, min($limit, 40), $offset);

        $placesIds = [];

        foreach ($activityData as $item) {
            $placesIds[] = $item->place_id;
        }

        $placeContent->translate($placesIds, true);

        $response = $this->_groupSimilarActivities($activityData, $placeContent);

        // We remove the last object in the array because it may not be completely grouped
        if (count($response) >= $limit) {
            array_pop($response);
        }

        return $this->respond(['items' => $response]);
    }

    /**
     * We group similar user activities. For example, uploaded photos of one user
     * for one place with an interval of 5 minutes - we combine them into one activity
     * @param array $activityData
     * @param PlacesContent|null $placeContent
     * @return array
     */
    protected function _groupSimilarActivities(array $activityData, PlacesContent $placeContent = null): array {
        $categoriesModel = new CategoryModel();
        $categoriesData  = $categoriesModel->findAll();

        $groupData = [];

        if (empty($activityData)) {
            return $groupData;
        }

        foreach ($activityData as $item) {
            $lastGroup = end($groupData);
            $photoPath = PATH_PHOTOS . $item->place_id . '/';
            $itemPhoto = $item->type === 'photo' && $item->filename ? [
                'full'      => $photoPath . $item->filename . '.' . $item->extension,
                'preview'   => $photoPath . $item->filename . '_preview.' . $item->extension,
                'width'     => PHOTO_PREVIEW_WIDTH, // (int) $item->width,
                'height'    => PHOTO_PREVIEW_HEIGHT, // (int) $item->height,
                'placeId'   => $item->place_id
            ] : null;

            // We group activity by photos of one user, uploaded for one place and with a difference of no more than 5 minutes
            if (
                $lastGroup &&
//                $item->type === 'photo' &&
//                $lastGroup->type === 'photo' &&
                (!isset($lastGroup->place) || $lastGroup->place->id === $item->place_id) &&
                $lastGroup->author->id === $item->user_id &&
                (strtotime($lastGroup->created) - strtotime($item->created_at)) <= 600
            ) {
                $lastGroup->created  = $item->created_at; // Every time we update the loading time of the last photo
                $lastGroup->type     = $item->type;

                if ($itemPhoto) {
                    $lastGroup->photos[] = $itemPhoto;
                }

                continue;
            }

            $currentGroup = (object) [
                'type'    => $item->type,
                'created' => $item->created_at,
                'photos'  => []
            ];

            if ($placeContent && $categoriesData) {
                $findCategory = array_search($item->category, array_column($categoriesData, 'name'));

                $currentGroup->place = (object) [
                    'id'         => $item->place_id,
                    'title'      => $placeContent->get($item->place_id, 'title', $item->created_at),
                    'content'    => $placeContent->get($item->place_id, 'content', $item->created_at),
                    'difference' => (int) $placeContent->get($item->place_id, 'delta', $item->created_at),
                    'category'   => (object) [
                        'name'  => $categoriesData[$findCategory]->name,
                        'title' => $categoriesData[$findCategory]->title,
                    ]
                ];
            }

            if ($item->user_id) {
                $avatar = $item->user_avatar ? explode('.', $item->user_avatar) : null;
                $item->user_avatar = $avatar
                    ? PATH_AVATARS . $item->user_id . '/' . $avatar[0] . '_small.' . $avatar[1]
                    : null;

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

        return array_values($groupData);
    }
}