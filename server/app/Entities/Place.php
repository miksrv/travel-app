<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Place extends Entity {
    protected $casts = [
        'id'               => 'string',
        'category'         => 'string',
        'address_country'  => 'integer',
        'address_region'   => 'integer',
        'address_district' => 'integer',
        'address_city'     => 'integer',
        'latitude'         => 'float',
        'longitude'        => 'float',
        'user_id'          => 'string',
        'rating'           => 'integer',
        'views'            => 'integer',
        'cover'            => 'string',
        'tags'             => 'json'
    ];
}
