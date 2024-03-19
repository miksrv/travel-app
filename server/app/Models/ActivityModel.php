<?php namespace App\Models;

class ActivityModel extends MyBaseModel {
    protected $table            = 'activity';
    protected $primaryKey       = 'id';

    protected $useAutoIncrement = false;

    protected $returnType       = \App\Entities\Activity::class;
    protected $useSoftDeletes   = true;

    // protected array $hiddenFields = ['id'];

    protected $allowedFields = [
        'type',
        'session_id',
        'user_id',
        'photo_id',
        'place_id',
        'comment_id',
        'rating_id',
        'created_at'
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = ['beforeInsert'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    // protected $afterFind      = ['prepareOutput'];
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

    /**
     * @param string $placeId
     * @param string $excludeUserId
     * @return array
     */
    public function gePlaceEditors(string $placeId, string $excludeUserId): array {
        return $this
            ->select('users.id as id, users.name, users.avatar')
            ->join('users', 'activity.user_id = users.id', 'left')
            ->where(['place_id' => $placeId, 'user_id !=' => $excludeUserId])
            ->whereIn('type', ['edit', 'cover', 'photo'])
            ->groupBy('user_id')
            ->findAll();
    }
}
