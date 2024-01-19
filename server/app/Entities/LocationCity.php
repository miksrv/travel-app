<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class LocationCity extends Entity {
    protected $casts = [
        'id'          => 'integer',
        'country_id'  => 'integer',
        'region_id'   => 'integer',
        'district_id' => 'integer',
        'title_en'    => 'string',
        'title_ru'    => 'string'
    ];
}
