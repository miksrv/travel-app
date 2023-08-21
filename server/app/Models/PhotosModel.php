<?php namespace App\Models;

use App\Entities\Place;

class PhotosModel extends MyBaseModel
{
    protected $table      = 'photos';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false;

    protected $returnType     = Place::class;
    protected $useSoftDeletes = true;

    protected array $hiddenFields = ['created_at', 'updated_at', 'deleted_at', 'overpass_id'];

    // The updatable fields
    protected $allowedFields = [
        'title',
        'latitude',
        'longitude',
        'place',
        'author',
        'filename',
        'extension',
        'filesize',
        'width',
        'height',
        'created_at',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['beforeInsert'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    protected function beforeInsert(array $data): array
    {
        $data['data']['id'] = uniqid();

        return $data;
    }
}