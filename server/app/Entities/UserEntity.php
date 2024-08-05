<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserEntity extends Entity {
    protected $casts = [
        'id'          => 'string',
        'name'        => 'string',
        'email'       => 'string',
        'password'    => 'string',
        'role'        => 'string',
        'auth_type'   => 'string',
        'locale'      => 'string',
        'level'       => '?integer',
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
