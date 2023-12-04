<?php namespace App\Libraries;

use App\Entities\UserNotification;
use App\Models\UsersNotifications;
use ReflectionException;

class UserNotify {
    private UsersNotifications $userNotifyModel;

    protected array $types = ['photo', 'place', 'rating', 'edit', 'experience', 'level', 'achievements'];

    public function __construct() {
        $this->userNotifyModel = new UsersNotifications();
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

        if ($this->userNotifyModel->insert($userNotify)) {
            return true;
        }

        return false;
    }
}
