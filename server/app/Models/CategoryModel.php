<?php namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model {
    protected $table      = 'category';
    protected $primaryKey = 'name';

    protected $useAutoIncrement = false;

    protected $returnType     = \App\Entities\Category::class;
    protected $useSoftDeletes = false;

    protected $allowedFields = [
        'name',
        'title_en',
        'title_ru',
        'content_en',
        'content_ru',
    ];

    protected $useTimestamps = false;

    protected $validationRules = [
        'name'       => 'required|alpha_numeric_space|max_length[50]',
        'title_en'   => 'string|max_length[50]',
        'title_ru'   => 'string|max_length[50]',
        'content_en' => 'string|max_length[300]',
        'content_ru' => 'string|max_length[300]',
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