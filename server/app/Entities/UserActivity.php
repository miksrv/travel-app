<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserActivity extends Entity {
    protected $casts = [
        'type'      => 'string',
        'user_id'   => 'string',
        'photo_id'  => 'string',
        'place_id'  => 'string',
        'rating_id' => 'string'
    ];
}
