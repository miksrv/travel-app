<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class User extends Entity
{
    protected $casts = [
        'name'       => 'string',
        'email'      => 'string',
        'password'   => 'string',
        'level'      => 'integer',
        'reputation' => 'integer',
    ];
}
