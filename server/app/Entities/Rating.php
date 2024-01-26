<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Rating extends Entity {
    protected $casts = [
        'place_id'   => 'string',
        'user_id'    => 'string',
        'session_id' => 'string',
        'rating'     => 'string',
        'value'      => 'integer'
    ];
}
