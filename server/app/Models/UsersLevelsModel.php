<?php

namespace App\Models;

use CodeIgniter\Model;

class UsersLevelsModel extends Model {
    protected $table            = 'users_levels';
    protected $primaryKey       = 'level';
    protected $returnType       = \App\Entities\UserLevelEntity::class;
    protected $useAutoIncrement = false;
    protected $useSoftDeletes   = false;

    // protected array $hiddenFields = [];

    protected $allowedFields = [
        'title_en',
        'title_ru',
        'level',
        'experience'
    ];

    // protected $useTimestamps = true;
    // protected $dateFormat    = 'datetime';
    // protected $createdField  = 'created_at';
    // protected $updatedField  = 'updated_at';
    // protected $deletedField  = 'deleted_at';

    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = []; // prepareOutput
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}