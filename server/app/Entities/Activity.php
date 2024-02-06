<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Activity extends Entity {
    protected $casts = [
        'type'       => 'string',
        'session_id' => 'string',
        'user_id'    => 'string',
        'photo_id'   => 'string',
        'place_id'   => 'string',
        'rating_id'  => 'string'
    ];
}
