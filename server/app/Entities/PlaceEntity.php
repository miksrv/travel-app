<?php

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class PlaceEntity extends Entity {
    protected $attributes = [
        'id'          => null,
        'lat'         => null,
        'lon'         => null,
        'rating'      => null,
        'views'       => null,
        'photos'      => null,
        'comments'    => null,
        'bookmarks'   => null,
        'address_en'  => null,
        'address_ru'  => null,
        'country_id'  => null,
        'region_id'   => null,
        'district_id' => null,
        'locality_id' => null,
        'user_id'     => null
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $casts = [
        'id'          => 'string',
        'lat'         => 'float',
        'lon'         => 'float',
        'rating'      => 'float',
        'views'       => 'integer',
        'photos'      => 'integer',
        'comments'    => 'integer',
        'bookmarks'   => 'integer',
        'address_en'  => 'string',
        'address_ru'  => 'string',
        'country_id'  => 'integer',
        'region_id'   => 'integer',
        'district_id' => 'integer',
        'locality_id' => 'integer',
        'user_id'     => 'string',

        'created' => 'datetime',
        'updated' => 'datetime',
    ];
}
