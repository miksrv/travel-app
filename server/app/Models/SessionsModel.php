<?php namespace App\Models;

use App\Entities\Session;
use CodeIgniter\Model;

class SessionsModel extends Model {
    protected $table      = 'sessions';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;

    protected $returnType     = Session::class;
    protected $useSoftDeletes = false;

    // The updatable fields
    protected $allowedFields = [
        'id',
        'ip',
        'user',
        'user_agent',
        'latitude',
        'longitude',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [

    ];
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