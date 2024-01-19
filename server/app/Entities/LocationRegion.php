<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class LocationRegion extends Entity {
    protected $casts = [
        'country_id' => 'integer',
        'title_en'   => 'string',
        'title_ru'   => 'string'
    ];
}
