<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Category extends Entity {
    protected $casts = [
        'name'       => 'string',
        'title_en'   => 'string',
        'title_ru'   => 'string',
        'content_en' => 'string',
        'content_ru' => 'string'
    ];
}
