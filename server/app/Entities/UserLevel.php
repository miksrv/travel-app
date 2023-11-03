<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserLevel extends Entity {
    protected $casts = [
        'id'         => 'integer',
        'name'       => 'string',
        'text'       => 'string',
        'level'      => 'integer',
        'experience' => 'integer',
    ];
}
