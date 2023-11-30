<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class TranslationPlace extends Entity {
    protected $casts = [
        'place_id' => 'string',
        'user_id'  => 'string',
        'language' => 'string',
        'title'    => 'title',
        'content'  => 'content',
        'delta'    => 'integer',
    ];
}
