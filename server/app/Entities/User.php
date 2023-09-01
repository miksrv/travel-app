<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class User extends Entity
{
    protected $casts = [
        'name'       => 'string',
        'email'      => 'string',
        'avatar'     => 'string',
        'website'    => 'string',
        'password'   => 'string',
        'level'      => 'integer',
        'reputation' => 'integer',
    ];
}
