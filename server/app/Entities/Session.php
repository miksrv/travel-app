<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Session extends Entity
{
    protected $casts = [
        'id'         => 'string',
        'ip'         => 'string',
        'user'       => 'string',
        'user_agent' => 'string',
        'latitude'   => 'float',
        'longitude'  => 'float',
    ];
}
