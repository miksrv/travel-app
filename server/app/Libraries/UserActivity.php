<?php namespace App\Libraries;

use App\Models\UsersActivityModel;
use CodeIgniter\I18n\Time;
use ReflectionException;

const ACTIVITY_FLOOD_MIN = 30;

class UserActivity {
    private UsersActivityModel $model;

    private UserLevels $userLevels;
    private SessionLibrary $session;

    protected array $types = ['photo', 'place', 'rating', 'edit', 'cover'];

    public function __construct() {
        $this->userLevels = new UserLevels();
        $this->model      = new UsersActivityModel();
        $this->session    = new SessionLibrary();
    }

    /**
     * @param $photoId
     * @param $placeId
     * @return bool
     * @throws ReflectionException
     */
    public function photo($photoId, $placeId): bool {
        return $this->_add('photo', $photoId, $placeId);
    }

    /**
     * @param $placeId
     * @return bool
     * @throws ReflectionException
     */
    public function place($placeId): bool {
        return $this->_add('place', null, $placeId);
    }

    /**
     * @throws ReflectionException
     */
    public function edit($placeId): bool {
        return $this->_add('edit', null, $placeId);
    }

    /**
     * @throws ReflectionException
     */
    public function cover($placeId, $photoId): bool {
        return $this->_add('cover', $photoId, $placeId);
    }

    /**
     * @param $placeId
     * @param $ratingId
     * @return bool
     * @throws ReflectionException
     */
    public function rating($placeId, $ratingId): bool {
        return $this->_add('rating', null, $placeId, $ratingId);
    }

    /**
     * @param string $type
     * @param string|null $photoId
     * @param string|null $placeId
     * @param string|null $ratingId
     * @return bool
     * @throws ReflectionException
     */
    protected function _add(
        string $type,
        string|null $photoId  = null,
        string|null $placeId  = null,
        string|null $ratingId = null,
    ): bool
    {
        if (
            !in_array($type, $this->types) ||
            !$this->session->isAuth ||
            !$this->session->user?->id
        ) {
            return false;
        }

        /**
         * If no more than that many minutes have passed since the user’s previous activity with exactly
         * the same parameters (for example, editing a specific place),
         * then new activity and experience will not be added
         */
        $lastData = $this->model
            ->where([
                'type'      => $type,
                'user_id'   => $this->session->user->id,
                'place_id'  => $placeId,
                'photo_id'  => $photoId,
                'rating_id' => $ratingId
            ])
            ->orderBy('created_at', 'DESC')
            ->first();

        if ($lastData) {
            $time = new Time('now');
            $diff = $time->difference($lastData->created_at);

            if (abs($diff->getMinutes()) <= ACTIVITY_FLOOD_MIN) {
                return false;
            }
        }

        $activity = new \App\Entities\UserActivity();

        $activity->type      = $type;
        $activity->user_id   = $this->session->user->id;
        $activity->photo_id  = $photoId;
        $activity->place_id  = $placeId;
        $activity->rating_id = $ratingId;

        if ($this->model->insert($activity)) {

            $this->session->update();
            $this->userLevels->experience(
                $type,
                $this->session->user?->id,
                $type === 'photo' ? $photoId : ($type === 'rating' ? $ratingId : $placeId)
            );
            // TODO Не надо выше передавать ссылку на объект для нотификации!

            return true;
        }

        return false;
    }
}
