<?php namespace App\Libraries;

use App\Models\ActivityModel;
use CodeIgniter\I18n\Time;
use Exception;
use ReflectionException;

const ACTIVITY_FLOOD_MIN = 30;

class ActivityLibrary {
    private string $owner;

    protected array $types = ['photo', 'place', 'rating', 'edit', 'cover'];

    public function owner(string $userId): static {
        $this->owner = $userId;

        return $this;
    }

    /**
     * @param $photoId
     * @param $placeId
     * @throws ReflectionException
     */
    public function photo($photoId, $placeId): void {
        $this->_add('photo', $photoId, $placeId);
    }

    /**
     * @param $placeId
     * @throws ReflectionException
     */
    public function place($placeId): void {
        $this->_add('place', null, $placeId);
    }

    /**
     * @throws ReflectionException
     */
    public function edit($placeId): void {
        $this->_add('edit', null, $placeId);
    }

    /**
     * @throws ReflectionException
     */
    public function cover($placeId, $photoId): void {
        $this->_add('cover', $photoId, $placeId);
    }

    /**
     * @param $placeId
     * @param $ratingId
     * @throws ReflectionException
     */
    public function rating($placeId, $ratingId): void {
        $this->_add('rating', null, $placeId, $ratingId);
    }

    /**
     * @param string $type One of: 'photo', 'place', 'rating', 'edit', 'cover'
     * @param string|null $photoId
     * @param string|null $placeId
     * @param string|null $ratingId
     * @throws ReflectionException
     * @throws Exception
     */
    protected function _add(
        string $type,
        string|null $photoId  = null,
        string|null $placeId  = null,
        string|null $ratingId = null,
    ): void
    {
        if (!in_array($type, $this->types)) {
            return ;
        }

        $model   = new ActivityModel();
        $session = new SessionLibrary();

        /**
         * If no more than that many minutes have passed since the user’s previous activity with exactly
         * the same parameters (for example, editing a specific place),
         * then new activity and experience will not be added
         */
        $lastData = $model
            ->where([
                'type'       => $type,
                'session_id' => !$session->isAuth ? $session->id : null,
                'user_id'    => $session->user?->id ?? null,
                'place_id'   => $placeId,
                'photo_id'   => $photoId,
                'rating_id'  => $ratingId
            ])
            ->orderBy('created_at', 'DESC')
            ->first();

        if ($lastData) {
            $time = new Time('now');
            $diff = $time->difference($lastData->created_at);

            if (abs($diff->getMinutes()) <= ACTIVITY_FLOOD_MIN) {
                return ;
            }
        }

        $activity = new \App\Entities\Activity();

        $activity->type       = $type;
        $activity->session_id = !$session->isAuth ? $session->id : null;
        $activity->user_id    = $session->user?->id ?? null;
        $activity->photo_id   = $photoId;
        $activity->place_id   = $placeId;
        $activity->rating_id  = $ratingId;

        $model->insert($activity);
        $session->update();

        // If user authorized - add user experience
        if ($session->isAuth && $session->user?->id) {
            $levels = new LevelsLibrary();
            $levels->push($type, $session->user?->id, $model->getInsertID());
        }

        // Send notification to place owner
        if ($this->owner && $this->owner !== $session->user?->id) {
            $notify = new NotifyLibrary();
            $notify->push($type, $this->owner, $model->getInsertID());
        }
    }
}
