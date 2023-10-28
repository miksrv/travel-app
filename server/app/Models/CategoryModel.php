<?php namespace App\Models;

use App\Entities\Category;
use CodeIgniter\Model;

class CategoryModel extends Model {
    protected $table      = 'category';
    protected $primaryKey = 'name';

    protected $useAutoIncrement = false;

    protected $returnType     = Category::class;
    protected $useSoftDeletes = false;

    // The updatable fields
    protected $allowedFields = [
        'name',
        'title',
        'info'
    ];

    // Dates
    protected $useTimestamps = false;

    // Validation
    protected $validationRules = [
        'name'  => 'required|alpha_numeric_space|max_length[50]',
        'title' => 'string|max_length[50]',
        'info'  => 'string|max_length[300]',
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