<?php

namespace App\Models;

class LocationCountriesModel extends ApplicationBaseModel {
    protected $table            = 'location_countries';
    protected $primaryKey       = 'id';
    protected $returnType       = \App\Entities\LocationCountryEntity::class;
    protected $useAutoIncrement = true;
    protected $useSoftDeletes   = true;

    protected array $hiddenFields = ['created_at', 'updated_at', 'deleted_at'];

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