<?php

namespace App\Models;

class PlacesContentModel extends ApplicationBaseModel {
    protected $table            = 'places_content';
    protected $primaryKey       = 'id';
    protected $returnType       = \App\Entities\PlaceContentEntity::class;
    protected $useAutoIncrement = false;
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'place_id',
        'user_id',
        'locale',
        'title',
        'content',
        'delta',
        'created_at'
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = ['generateId'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}
