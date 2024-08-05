<?php

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class PhotoEntity extends Entity {
    protected $attributes = [
        'place_id'  => null,
        'user_id'   => null,
        'lat'       => null,
        'lon'       => null,
        'title_en'  => null,
        'title_ru'  => null,
        'filename'  => null,
        'extension' => null,
        'filesize'  => null,
        'width'     => null,
        'height'    => null,
        'created'   => null,
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $casts = [
        'place_id'  => 'string',
        'user_id'   => 'string',
        'lat'       => 'float',
        'lon'       => 'float',
        'title_en'  => 'string',
        'title_ru'  => 'string',
        'filename'  => 'string',
        'extension' => 'string',
        'filesize'  => 'integer',
        'width'     => 'integer',
        'height'    => 'integer',
        'created'   => 'datetime',
    ];

    protected $datamap = [
        // property_name => db_column_name
        'created' => 'created_at'
    ];
}
