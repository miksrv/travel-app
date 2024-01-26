<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserNotification extends Entity {
    protected $casts = [
        'type'      => 'string',
        'user_id'   => 'string',
        'object_id' => 'string'
    ];
}
