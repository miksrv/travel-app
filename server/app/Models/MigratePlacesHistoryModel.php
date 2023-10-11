<?php namespace App\Models;

use CodeIgniter\Model;

class MigratePlacesHistoryModel extends Model
{
    protected $table      = 'cms_geo_placeshistory';
    protected $primaryKey = 'item_id';

    protected $useAutoIncrement = false;

    protected $returnType     = 'object';
    protected $useSoftDeletes = false;

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