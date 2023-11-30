<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserBookmark extends Entity {
    protected $casts = [
        'user_id'  => 'string',
        'place_id' => 'integer',
    ];
}
