<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class AddressCity extends Entity
{
    protected $casts = [
        'id'       => 'integer',
        'country'  => 'integer',
        'region'   => 'integer',
        'district' => 'integer',
        'name'     => 'string'
    ];
}
