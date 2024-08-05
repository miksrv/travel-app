<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class LocationCountryEntity extends Entity {
    protected $casts = [
        'id'       => 'integer',
        'title_en' => 'string',
        'title_ru' => 'string'
    ];
}
