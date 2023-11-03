<?php namespace App\Models;

use App\Entities\UserLevel;
use CodeIgniter\Model;

class UsersLevelsModel extends Model {
    protected $table      = 'users_levels';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false;

    protected $returnType     = UserLevel::class;
    protected $useSoftDeletes = false;

    protected array $hiddenFields = ['id'];

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
    protected $allowCallbacks = false;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}