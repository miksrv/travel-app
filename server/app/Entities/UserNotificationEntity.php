<?php

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserNotificationEntity extends Entity {
    protected $attributes = [
        'type'        => null,
        'read'        => null,
        'meta'        => null,
        'user_id'     => null,
        'activity_id' => null,
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $casts = [
        'type'        => 'string',
        'read'        => 'bool',
        'meta'        => 'json',
        'user_id'     => 'string',
        'activity_id' => 'string'
    ];
}
