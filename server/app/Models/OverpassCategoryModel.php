<?php namespace App\Models;

use App\Entities\OverpassCategory;
use CodeIgniter\Model;

class OverpassCategoryModel extends Model
{
    protected $table      = 'overpass_category';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;

    protected $returnType     = OverpassCategory::class;
    protected $useSoftDeletes = false;

    // The updatable fields
    protected $allowedFields = [
        'category',
        'subcategory',
        'title',
        'category_map'
    ];

    // Dates
    protected $useTimestamps = false;

    // Validation
    protected $validationRules = [
        'category'    => 'required|alpha_numeric_space|max_length[50]',
        'subcategory' => 'required|alpha_numeric_space|max_length[50]',
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