<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Comment extends Entity {
    protected $casts = [
        'id'          => 'string',
        'place_id'    => 'string',
        'user_id'     => 'string',
        'answer_id'   => 'string',
        'content'     => 'string'
    ];
}
