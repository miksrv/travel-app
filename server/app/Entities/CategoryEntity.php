<?php

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class CategoryEntity extends Entity {
    protected $attributes = [
        'name'       => null,
        'title_en'   => null,
        'title_ru'   => null,
        'content_en' => null,
        'content_ru' => null,
    ];

    // protected $dates = [
    //     'created_at',
    //     'updated_at',
    //     'deleted_at'
    // ];

    protected $casts = [
        'name'       => 'string',
        'title_en'   => 'string',
        'title_ru'   => 'string',
        'content_en' => 'string',
        'content_ru' => 'string'
    ];
}
