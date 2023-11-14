<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Rating extends Entity {
    protected $casts = [
        'place'   => 'string',
        'author'  => 'string',
        'session' => 'string',
        'rating'  => 'string',
        'value'   => 'integer',
    ];
}
