<?php namespace App\Models;

class UsersVisitedPlacesModel extends ApplicationBaseModel {
    protected $table            = 'users_visited_places';
    protected $primaryKey       = 'id';
    protected $returnType       = \App\Entities\UserVisitedPlaceEntity::class;
    protected $useAutoIncrement = false;
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'user_id',
        'place_id'
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
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}
