<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Session extends Entity {
    protected $casts = [
        'id'      => 'string',
        'user_id' => 'string',
        'user_ip' => 'string',
        'lat'     => 'float',
        'lon'     => 'float'
    ];
}
