<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class SendingMail extends Entity {
    protected $casts = [
        'user_id'     => 'string',
        'activity_id' => 'string',
        'status'      => 'string',
        'email'       => 'string',
        'subject'     => 'string',
        'message'     => 'string',
        'sent_email'  => 'string'
    ];
}
