<?php namespace App\Models;

class LocationLocalitiesModel extends MyBaseModel {
    protected $table      = 'location_localities';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;

    protected $returnType     = \App\Entities\LocationLocality::class;
    protected $useSoftDeletes = true;

    protected array $hiddenFields = ['created_at', 'updated_at', 'deleted_at'];

    protected $allowedFields = [
        'country_id',
        'region_id',
        'district_id',
        'title_en',
        'title_ru'
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'title_en' => 'required|string|max_length[100]',
        'title_ru' => 'required|string|max_length[100]'
    ];
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