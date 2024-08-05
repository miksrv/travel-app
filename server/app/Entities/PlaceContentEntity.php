<?php

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class PlaceContentEntity extends Entity {
    protected $attributes = [
        'place_id' => null,
        'user_id'  => null,
        'locale'   => null,
        'title'    => null,
        'content'  => null,
        'delta'    => null,
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $casts = [
        'place_id' => 'string',
        'user_id'  => 'string',
        'locale'   => 'string',
        'title'    => 'string',
        'content'  => 'string',
        'delta'    => 'integer'
    ];
}
