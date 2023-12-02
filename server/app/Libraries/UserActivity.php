<?php namespace App\Libraries;

use App\Models\UsersActivityModel;
use ReflectionException;

class UserActivity {
    private UsersActivityModel $usersActivityModel;

    private UserLevels $userLevels;
    private Session $session;

    protected array $types = ['photo', 'place', 'rating'];

    public function __construct() {
        $this->usersActivityModel = new UsersActivityModel();
        $this->userLevels = new UserLevels();
        $this->session    = new Session();
    }

    /**
     * @param $photoId
     * @param $placeId
     * @return bool
     * @throws ReflectionException
     */
    public function photo($photoId, $placeId): bool {
        if (!$this->session->isAuth) {
            return false;
        }

        $this->session->update();
        $this->userLevels->experience('photo', $this->session->userId, $photoId);
        return $this->_add('photo', $this->session->userId, $photoId, $placeId);
    }

    /**
     * @param $placeId
     * @return bool
     * @throws ReflectionException
     */
    public function place($placeId): bool {
        if (!$this->session->isAuth) {
            return false;
        }

        $this->session->update();
        $this->userLevels->experience('place', $this->session->userId, $placeId);
        return $this->_add('place', $this->session->userId, null, $placeId);
    }

    /**
     * @param $placeId
     * @param $ratingId
     * @return bool
     * @throws ReflectionException
     */
    public function rating($placeId, $ratingId): bool {
        if (!$this->session->isAuth) {
            return false;
        }

        $this->session->update();
        $this->userLevels->experience('rating', $this->session->userId, $ratingId);
        return $this->_add('rating', $this->session->userId, null, $placeId, $ratingId);
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
