<?php namespace App\Models;

class PlacesTagsModel extends MyBaseModel {
    protected $table            = 'places_tags';
    protected $primaryKey       = 'id';

    protected $useAutoIncrement = false;

    protected $returnType       = 'object';
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'tag_id',
        'place_id'
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

    /**
     * @param string $placeId
     * @return array
     */
    public function getPlaceTags(string $placeId): array {
        return $this
            ->select('tags.id as id, count')
            ->join('tags', 'places_tags.tag_id = tags.id', 'left')
            ->where('place_id', $placeId)
            ->findAll();
    }

    /**
     * @param string $placeId
     */
    public function deletePlaceTags(string $placeId): void {
        $this->where('place_id', $placeId)->delete();
    }
}
