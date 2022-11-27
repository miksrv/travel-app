<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Subcategory extends Entity
{
    protected $casts = [
        'id'       => 'integer',
        'category' => 'integer',
        'name'     => 'string',
    ];
}