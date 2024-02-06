<?php namespace App\Libraries;

use App\Entities\UserNotification;
use App\Models\UsersNotificationsModel;
use ReflectionException;

class NotifyLibrary {
    private UsersNotificationsModel $model;

    protected array $types = ['photo', 'place', 'rating', 'edit', 'cover', 'experience', 'level', 'achievements'];

    public function __construct() {
        $this->model = new UsersNotificationsModel();
    }

    /**
     * @param string $userId
     * @return bool
     * @throws ReflectionException
     */
    public function level(string $userId): bool {
        return $this->_add('level', $userId);
    }

    /**
     * @param string $userId
     * @return bool
     * @throws ReflectionException
     */
    public function achievements(string $userId): bool {
        return $this->_add('achievements', $userId);
    }

    /**
     * @param string $userId
     * @param string $objectId
     * @return bool
     * @throws ReflectionException
     */
    public function rating(string $userId, string $objectId): bool {
        return $this->_add('rating', $userId, $objectId);
    }

    /**
     * @param string $userId
     * @param string $objectId
     * @return bool
     * @throws ReflectionException
     */
    public function comment(string $userId, string $objectId): bool {
        return $this->_add('comment', $userId, $objectId);
    }

    /**
     * @param string $userId
     * @param string $objectId
     * @return bool
     * @throws ReflectionException
     */
    public function place(string $userId, string $objectId): bool {
        return $this->_add('place', $userId, $objectId);
    }

    /**
     * @param string $userId
     * @param string $objectId
     * @return bool
     * @throws ReflectionException
     */
    public function photo(string $userId, string $objectId): bool {
        return $this->_add('photo', $userId, $objectId);
    }

    /**
     * @param string $userId
     * @param string $objectId
     * @return bool
     * @throws ReflectionException
     */
    public function experience(string $userId, string $objectId): bool {
        return $this->_add('experience', $userId, $objectId);
    }

    /**
     * @param string $userId
     * @param string $type
     * @param string|null $objectId
     * @return bool
     * @throws ReflectionException
     */
    protected function _add(string $type, string $userId, string|null $objectId = null): bool {
        if (!$userId || !in_array($type, $this->types)) {
            return false;
        }

        $userNotify = new UserNotification();

        $userNotify->user_id   = $userId;
        $userNotify->object_id = $objectId;
        $userNotify->type      = $type;

        if ($this->model->insert($userNotify)) {
            return true;
        }

        return false;
    }

    /**
     * @param string $type One of: 'photo', 'place', 'rating', 'edit', 'cover', 'experience', 'level', 'achievements'
     * @param string $userId
     * @param string|null $activity
     * @throws ReflectionException
     */
    public function push(string $type, string $userId, string|null $activity = null): void
    {
        $notification = new UserNotification();
        $notification->type        = $type;
        $notification->user_id     = $userId;
        $notification->activity_id = $activity;

        $model = new UsersNotificationsModel();
        $model->insert($notification);
    }
}
