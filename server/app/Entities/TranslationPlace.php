<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class TranslationPlace extends Entity
{
    protected $casts = [
        'place'    => 'string',
        'language' => 'string',
        'author'   => 'string',
        'title'    => 'title',
        'content'  => 'content',
        'delta'    => 'integer',
    ];
}
