<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserActivity extends Entity {
    protected $casts = [
        'user'   => 'string',
        'type'   => 'string',
        'photo'  => 'string',
        'place'  => 'string',
        'rating' => 'string'
    ];
}
