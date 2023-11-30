<?php namespace App\Libraries;

use App\Entities\UserNotification;
use App\Models\UsersNotifications;
use ReflectionException;

class UserNotify {
    private UsersNotifications $userNotifyModel;

    protected array $types = ['level', 'achievements', 'rating', 'comment', 'place', 'photo', 'experience'];

    public function __construct() {
        $this->userNotifyModel = new UsersNotifications();
    }

    /**
     * @param string $userId
     * @param string $objectId
     * @param string $type
     * @return bool
     * @throws ReflectionException
     */
    public function add(string $userId, string $objectId, string $type): bool {
        if (!$userId || !$objectId || !in_array($type, $this->types)) {
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
