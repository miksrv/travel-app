<?php

namespace App\Models;

class PhotosModel extends ApplicationBaseModel {
    protected $table            = 'photos';
    protected $primaryKey       = 'id';
    protected $returnType       = \App\Entities\PhotoEntity::class;
    protected $useAutoIncrement = false;
    protected $useSoftDeletes   = true;

    protected array $hiddenFields = ['updated_at', 'deleted_at'];

    protected $allowedFields = [
        'place_id',
        'user_id',
        'lat',
        'lon',
        'title_en',
        'title_ru',
        'filename',
        'extension',
        'filesize',
        'width',
        'height',
        'created_at',
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
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];
}