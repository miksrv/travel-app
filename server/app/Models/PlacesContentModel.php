<?php namespace App\Models;

class PlacesContentModel extends MyBaseModel {
    protected $table            = 'places_content';
    protected $primaryKey       = 'id';

    protected $useAutoIncrement = false;

    protected $returnType       = \App\Entities\PlaceContent::class;
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
    protected $beforeInsert   = ['beforeInsert'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * @param array $data
     * @return array
     */
    protected function beforeInsert(array $data): array {
        $data['data']['id'] = uniqid();

        return $data;
    }
}
