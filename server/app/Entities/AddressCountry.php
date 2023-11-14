<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class AddressCountry extends Entity {
    protected $casts = [
        'id'   => 'integer',
        'name' => 'string'
    ];
}
