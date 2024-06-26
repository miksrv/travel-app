<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Activity extends Entity {
    protected $casts = [
        'type'       => 'string',
        'views'      => 'integer',
        'session_id' => 'string',
        'user_id'    => 'string',
        'photo_id'   => 'string',
        'place_id'   => 'string',
        'rating_id'  => 'string',
        'comment_id' => 'string'
    ];
}
