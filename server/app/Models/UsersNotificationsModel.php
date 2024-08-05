<?php

namespace App\Models;

class UsersNotificationsModel extends ApplicationBaseModel {
    protected $table            = 'users_notifications';
    protected $primaryKey       = 'id';
    protected $returnType       = \App\Entities\UserNotificationEntity::class;
    protected $useAutoIncrement = false;
    protected $useSoftDeletes   = false;

    protected array $hiddenFields = ['user_id, activity_id, created_at'];

    protected $allowedFields = [
        'type',
        'read',
        'meta',
        'user_id',
        'activity_id'
    ];

    protected $useTimestamps = false;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    // protected $updatedField  = 'updated_at';
    // protected $deletedField  = 'deleted_at';

    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = ['generateId'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}
