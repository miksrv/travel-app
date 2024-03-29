<?php namespace App\Models;

use App\Entities\UserNotification;

class UsersNotificationsModel extends MyBaseModel {
    protected $table            = 'users_notifications';
    protected $primaryKey       = 'id';

    protected $useAutoIncrement = false;

    protected $returnType       = UserNotification::class;
    protected $useSoftDeletes   = false;

    protected array $hiddenFields = ['user_id, activity_id, created_at'];

    protected $allowedFields = [
        'type',
        'read',
        'meta',
        'user_id',
        'activity_id'
    ];

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';

    // Validation
    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['beforeInsert'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * @param array $data
     * @return array
     */
    protected function beforeInsert(array $data): array {
        $data['data']['id'] = uniqid();

        return $data;
    }
}
