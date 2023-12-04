<?php namespace App\Models;

use App\Entities\UserLevel;

class UsersLevelsModel extends MyBaseModel {
    protected $table      = 'users_levels';
    protected $primaryKey = 'level';

    protected $useAutoIncrement = false;

    protected $returnType     = UserLevel::class;
    protected $useSoftDeletes = false;

    protected array $hiddenFields = [];

    // The updatable fields
    protected $allowedFields = [
        'name',
        'text',
        'level',
        'experience'
    ];

    // Validation
    protected $validationRules = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}