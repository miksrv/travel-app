<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Place extends Entity
{
    protected $casts = [
        'category'         => 'string',
        'subcategory'      => 'string',
        'address_country'  => 'integer',
        'address_region'   => 'integer',
        'address_district' => 'integer',
        'address_city'     => 'integer',
        'latitude'         => 'float',
        'longitude'        => 'float',
        'author'           => 'string',
        'rating'           => 'integer',
        'views'            => 'integer',
        'tags'             => 'json'
    ];
}
