<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class PlaceEntity extends Entity {
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
