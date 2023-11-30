<?php namespace App\Libraries;

use App\Models\UsersActivityModel;
use ReflectionException;

class UserActivity {
    private UsersActivityModel $usersActivityModel;

    protected array $types = ['photo', 'place', 'rating'];

    public function __construct() {
        $this->usersActivityModel = new UsersActivityModel();
    }


    /**
     * @param $userId
     * @param $photoId
     * @param $placeId
     * @return bool
     * @throws ReflectionException
     */
    public function photo($userId, $photoId, $placeId): bool {
        return $this->_add('photo', $userId, $photoId, $placeId);
    }

    /**
     * @param $userId
     * @param $placeId
     * @return bool
     * @throws ReflectionException
     */
    public function place($userId, $placeId): bool {
        return $this->_add('place', $userId, null, $placeId);
    }

    /**
     * @param $userId
     * @param $placeId
     * @param $ratingId
     * @return bool
     * @throws ReflectionException
     */
    public function rating($userId, $placeId, $ratingId): bool {
        return $this->_add('rating', $userId, null, $placeId, $ratingId);
    }

    /**
     * @param string $type
     * @param string|null $userId
     * @param string|null $photoId
     * @param string|null $placeId
     * @param string|null $ratingId
     * @return bool
     * @throws ReflectionException
     */
    protected function _add(
        string $type,
        string|null $userId   = null,
        string|null $photoId  = null,
        string|null $placeId  = null,
        string|null $ratingId = null,
    ): bool {
        if (!in_array($type, $this->types)) {
            return false;
        }

        $userActivity = new \App\Entities\UserActivity();

        $userActivity->type      = $type;
        $userActivity->user_id   = $userId;
        $userActivity->photo_id  = $photoId;
        $userActivity->place_id  = $placeId;
        $userActivity->rating_id = $ratingId;

        if ($this->usersActivityModel->insert($userActivity)) {
            return true;
        }

        return false;
    }
}
