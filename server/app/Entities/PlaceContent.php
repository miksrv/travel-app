<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class PlaceContent extends Entity {
    protected $casts = [
        'place_id' => 'string',
        'user_id'  => 'string',
        'locale'   => 'string',
        'title'    => 'string',
        'content'  => 'string',
        'delta'    => 'integer'
    ];
}
