<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Tag extends Entity {
    protected $casts = [
        'title_en' => 'string',
        'title_ru' => 'string',
        'count'    => 'integer'
    ];
}
