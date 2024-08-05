<?php

namespace App\Models;

use CodeIgniter\Model;

class OverpassCategoryModel extends Model {
    protected $table            = 'overpass_category';
    protected $primaryKey       = 'id';
    protected $returnType       = \App\Entities\OverpassCategory::class;
    protected $useAutoIncrement = true;
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'category',
        'subcategory',
        'title',
        'category_map'
    ];

    protected $useTimestamps = false;
    // protected $dateFormat    = 'datetime';
    // protected $createdField  = 'created_at';
    // protected $updatedField  = 'updated_at';
    // protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'category'    => 'required|alpha_numeric_space|max_length[50]',
        'subcategory' => 'required|alpha_numeric_space|max_length[50]',
        'name'        => 'required|alpha_numeric_space|max_length[50]',
        'title'       => 'string|max_length[50]',
    ];

    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

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