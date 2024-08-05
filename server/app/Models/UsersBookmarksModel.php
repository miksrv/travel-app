<?php namespace App\Models;


class UsersBookmarksModel extends ApplicationBaseModel {
    protected $table            = 'users_bookmarks';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = \App\Entities\UserBookmarkEntity::class;
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'user_id',
        'place_id'
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

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
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}
