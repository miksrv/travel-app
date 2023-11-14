<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Tag extends Entity {
    protected $casts = [
        'title'   => 'string',
        'counter' => 'integer',
    ];
}
