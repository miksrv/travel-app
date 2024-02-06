<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserNotification extends Entity {
    protected $casts = [
        'type'        => 'string',
        'read'        => 'bool',
        'meta'        => 'json',
        'user_id'     => 'string',
        'activity_id' => 'string'
    ];
}
