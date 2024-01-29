<?php namespace App\Libraries;

use App\Models\UsersActivityModel;
use ReflectionException;

class UserActivity {
    private UsersActivityModel $usersActivityModel;

    private UserLevels $userLevels;
    private SessionLibrary $session;

    protected array $types = ['photo', 'place', 'rating', 'edit'];

    public function __construct() {
        $this->usersActivityModel = new UsersActivityModel();
        $this->userLevels = new UserLevels();
        $this->session    = new SessionLibrary();
    }

    /**
     * @param $photoId
     * @param $placeId
     * @return bool
     * @throws ReflectionException
     */
    public function photo($photoId, $placeId): bool {
        return $this->_add('photo', $this->session->user?->id, $photoId, $placeId);
    }

    /**
     * @param $placeId
     * @return bool
     * @throws ReflectionException
     */
    public function place($placeId): bool {
        return $this->_add('place', $this->session->user?->id, null, $placeId);
    }

    public function edit($placeId): bool {
        return $this->_add('edit', $this->session->user?->id, null, $placeId);
    }

    /**
     * @param $placeId
     * @param $ratingId
     * @return bool
     * @throws ReflectionException
     */
    public function rating($placeId, $ratingId): bool {
        return $this->_add('rating', $this->session->user?->id, null, $placeId, $ratingId);
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
    ): bool
    {
        if (!in_array($type, $this->types) || !$this->session->isAuth) {
            return false;
        }

        $userActivity = new \App\Entities\UserActivity();

        $userActivity->type      = $type;
        $userActivity->user_id   = $userId;
        $userActivity->photo_id  = $photoId;
        $userActivity->place_id  = $placeId;
        $userActivity->rating_id = $ratingId;

        if ($this->usersActivityModel->insert($userActivity)) {

            $this->session->update();
            $this->userLevels->experience(
                $type,
                $this->session->user?->id,
                $type === 'photo' ? $photoId : ($type === 'rating' ? $ratingId : $placeId)
            );

            return true;
        }

        return false;
    }
}
