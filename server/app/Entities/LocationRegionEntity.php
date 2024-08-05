<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class LocationRegionEntity extends Entity {
    protected $casts = [
        'id'         => 'integer',
        'country_id' => 'integer',
        'title_en'   => 'string',
        'title_ru'   => 'string'
    ];
}
