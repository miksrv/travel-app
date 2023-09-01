<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Photo extends Entity
{
    protected $casts = [
        'translation' => 'string',
        'latitude'    => 'float',
        'longitude'   => 'float',
        'place'       => 'string',
        'order'       => 'integer',
        'author'      => 'string',
        'filename'    => 'string',
        'extension'   => 'string',
        'filesize'    => 'integer',
        'width'       => 'integer',
        'height'      => 'integer',
    ];
}
