<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Photo extends Entity {
    protected $casts = [
        'place_id'  => 'string',
        'user_id'   => 'string',
        'lat'       => 'float',
        'lng'       => 'float',
        'title_en'  => 'string',
        'title_ru'  => 'string',
        'filename'  => 'string',
        'extension' => 'string',
        'filesize'  => 'integer',
        'width'     => 'integer',
        'height'    => 'integer',
        'order'     => 'integer',
    ];
}
