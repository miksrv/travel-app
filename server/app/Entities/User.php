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
        'level'       => 'integer|null',
        'experience'  => 'integer',
        'reputation'  => 'integer',
        'website'     => 'string',
        'avatar'      => 'string',
        'settings'    => 'json',
        'activity_at' => 'datetime',

        'created'  => 'datetime',
        'activity' => 'datetime',
        'updated'  => 'datetime',
    ];
}
