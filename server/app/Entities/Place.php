<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Place extends Entity
{
    protected $casts = [
        'category'         => 'integer',
        'subcategory'      => 'integer',
        'address_country'  => 'integer',
        'address_province' => 'integer',
        'address_area'     => 'integer',
        'address_city'     => 'integer',
        'latitude'         => 'float',
        'longitude'        => 'float',
        'author'           => 'integer',
        'rating'           => 'integer',
        'views'            => 'integer',
        'tags'             => 'json'
    ];
}
