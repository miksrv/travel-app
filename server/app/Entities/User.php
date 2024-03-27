<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class User extends Entity {
    protected $casts = [
        'id'          => 'string',
        'name'        => 'string',
        'email'       => 'string',
        'password'    => 'string',
        'auth_type'   => 'string',
        'locale'      => 'string',
        'level'       => 'integer',
        'experience'  => 'integer',
        'reputation'  => 'integer',
        'website'     => 'string',
        'avatar'      => 'string',
        'activity_at' => 'datetime',

        'activity' => 'datetime',
        'updated'  => 'datetime',
    ];
}
