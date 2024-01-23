<?php namespace App\Models;

class UsersLevelsModel extends MyBaseModel {
    protected $table      = 'users_levels';
    protected $primaryKey = 'level';

    protected $useAutoIncrement = false;

    protected $returnType     = \App\Entities\UserLevel::class;
    protected $useSoftDeletes = false;

    protected array $hiddenFields = [];

    protected $allowedFields = [
        'title_en',
        'title_ru',
        'level',
        'experience'
    ];

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
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}