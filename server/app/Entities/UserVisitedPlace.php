<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class UserVisitedPlace extends Entity {
    protected $casts = [
        'user_id'  => 'string',
        'place_id' => 'integer',
    ];
}
