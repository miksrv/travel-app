<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class TagEntity extends Entity {
    protected $casts = [
        'title_en' => 'string',
        'title_ru' => 'string',
        'count'    => 'integer'
    ];
}
