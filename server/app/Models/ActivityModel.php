<?php

namespace App\Models;

class ActivityModel extends ApplicationBaseModel {
    protected $table            = 'activity';
    protected $primaryKey       = 'id';
    protected $returnType       = \App\Entities\ActivityEntity::class;
    protected $useAutoIncrement = false;
    protected $useSoftDeletes   = true;

    // protected array $hiddenFields = ['id'];

    protected $allowedFields = [
        'type',
        'views',
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
    protected $beforeInsert   = ['generateId'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = []; // ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * @param string $placeId
     * @param string $excludeUserId
     * @return array
     */
    public function gePlaceEditors(string $placeId, string $excludeUserId): array
    {
        return $this
            ->select('users.id as id, users.name, users.avatar')
            ->join('users', 'activity.user_id = users.id', 'left')
            ->where(['place_id' => $placeId, 'user_id !=' => $excludeUserId])
            ->whereIn('type', ['edit', 'cover', 'photo'])
            ->groupBy('user_id')
            ->findAll();
    }

    public function getActivityList(
        string $lastDate = null,
        string $userId = null,
        string $placeId = null,
        int $limit = 20,
        int $offset = 0
    ): array {
        $model = $this->select(
            'activity.*, places.id as place_id, places.category, users.id as user_id, users.name as user_name,
            users.avatar as user_avatar, photos.filename, photos.extension, photos.width, photos.height')
            ->join('places', 'activity.place_id = places.id', 'left')
            ->join('photos', 'activity.photo_id = photos.id', 'left')
            ->join('users', 'activity.user_id = users.id', 'left');

        if ($lastDate) {
            $model->where('activity.created_at < ', $lastDate);
        }

        if ($userId) {
            $model->where('activity.user_id', $userId);
        }

        if ($placeId) {
            $model->where('activity.place_id', $placeId);
        }

        return $model->whereIn('activity.type', ['photo', 'place', 'edit'])
            ->orderBy('activity.created_at, activity.type', 'DESC')
            ->findAll(min(abs($limit), 100), abs($offset));
    }

    public function getNextActivityItems(
        string $activityId,
        string $createdAt,
        string $userId,
        string $placeId,
        int $limit = 15
    ): array {
        return $this->select(
            'activity.*, places.id as place_id, places.category, users.id as user_id, users.name as user_name,
            users.avatar as user_avatar, photos.filename, photos.extension, photos.width, photos.height')
            ->join('places', 'activity.place_id = places.id', 'left')
            ->join('photos', 'activity.photo_id = photos.id', 'left')
            ->join('users', 'activity.user_id = users.id', 'left')
            ->where('activity.id !=', $activityId)
            ->where('activity.created_at >=', $createdAt)
            ->where('activity.user_id', $userId)
            ->where('activity.place_id', $placeId)
            ->orderBy('activity.created_at', 'ASC')
            ->findAll($limit);
    }
}
