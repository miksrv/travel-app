<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class LocationCountry extends Entity {
    protected $casts = [
        'id'       => 'integer',
        'title_en' => 'string',
        'title_ru' => 'string'
    ];
}
