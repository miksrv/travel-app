<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Place extends Entity {
    protected $casts = [
        'id'          => 'string',
        'category'    => 'string',
        'lat'         => 'float',
        'lon'         => 'float',
        'rating'      => 'float',
        'views'       => 'integer',
        'address_en'  => 'string',
        'address_ru'  => 'string',
        'country_id'  => 'integer',
        'region_id'   => 'integer',
        'district_id' => 'integer',
        'city_id'     => 'integer',
        'user_id'     => 'string',
    ];
}
