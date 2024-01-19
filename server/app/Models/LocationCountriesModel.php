<?php namespace App\Models;

use CodeIgniter\Model;

class LocationCountriesModel extends Model {
    protected $table      = 'location_countries';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;

    protected $returnType     = \App\Entities\LocationCountry::class;
    protected $useSoftDeletes = false;

    protected $allowedFields = [
        'title_en',
        'title_ru'
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'title_en' => 'required|string|max_length[50]',
        'title_ru' => 'required|string|max_length[50]',
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