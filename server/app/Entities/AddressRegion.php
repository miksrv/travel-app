<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class AddressRegion extends Entity
{
    protected $casts = [
        'id'      => 'integer',
        'country' => 'integer',
        'name'    => 'string'
    ];
}
