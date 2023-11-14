<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class AddressDistrict extends Entity {
    protected $casts = [
        'id'      => 'integer',
        'country' => 'integer',
        'region'  => 'integer',
        'name'    => 'string'
    ];
}
