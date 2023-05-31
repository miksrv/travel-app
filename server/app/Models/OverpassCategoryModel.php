<?php namespace App\Models;

use CodeIgniter\Model;

class OverpassCategoryModel extends Model
{
    protected $table      = 'overpass_category';
    protected $primaryKey = 'name';

    protected $useAutoIncrement = true;

    protected $returnType     = \App\Entities\OverpassCategory::class;
    protected $useSoftDeletes = false;

    // The updatable fields
    protected $allowedFields = [
        'category',
        'subcategory',
        'name',
        'title'
    ];

    // Dates
    protected $useTimestamps = false;

    // Validation
    protected $validationRules = [
        'category'    => 'required|integer|max_length[2]',
        'subcategory' => 'required|integer|max_length[4]',
        'name'        => 'required|alpha_numeric_space|max_length[50]',
        'title'       => 'string|max_length[50]',
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