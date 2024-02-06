<?php namespace App\Libraries;

use App\Entities\UserNotification;
use App\Models\UsersNotificationsModel;
use ReflectionException;

class NotifyLibrary {
    protected array $types = ['photo', 'place', 'rating', 'edit', 'cover', 'experience', 'level', 'achievements'];

    /**
     * @param string $type One of: 'photo', 'place', 'rating', 'edit', 'cover', 'experience', 'level', 'achievements'
     * @param string $userId
     * @param string|null $activity
     * @param array|object|null $value
     * @throws ReflectionException
     */
    public function push(
        string $type,
        string $userId,
        string|null $activity = null,
        array|object|null $value = null
    ): void
    {
        $notification = new UserNotification();
        $notification->type        = $type;
        $notification->meta        = $value ?? '';
        $notification->user_id     = $userId;
        $notification->activity_id = $activity;

        $model = new UsersNotificationsModel();
        $model->insert($notification);
    }
}
