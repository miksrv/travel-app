<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Photo extends Entity {
    protected $casts = [
        'translation' => 'string',
        'latitude'    => 'float',
        'longitude'   => 'float',
        'order'       => 'integer',
        'place_id'    => 'string',
        'user_id'     => 'string',
        'filename'    => 'string',
        'extension'   => 'string',
        'filesize'    => 'integer',
        'width'       => 'integer',
        'height'      => 'integer',
    ];
}
