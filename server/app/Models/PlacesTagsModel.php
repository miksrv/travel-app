<?php

namespace App\Models;

class PlacesTagsModel extends ApplicationBaseModel {
    protected $table            = 'places_tags';
    protected $primaryKey       = 'id';
    protected $returnType       = 'object';
    protected $useAutoIncrement = false;
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
    protected $beforeInsert   = ['generateId'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * @param string $placeId
     * @return array
     */
    public function getPlaceTags(string $placeId): array
    {
        return $this
            ->select('tags.id as id, count')
            ->join('tags', 'places_tags.tag_id = tags.id', 'left')
            ->where('place_id', $placeId)
            ->findAll();
    }

    /**
     * @param string $placeId
     */
    public function deleteByPlaceId(string $placeId): void
    {
        $this->where('place_id', $placeId)->delete();
    }

    /**
     * @param string $placeId
     * @return array
     */
    public function getAllByPlaceId(string $placeId): array
    {
        return $this->join('tags', 'tags.id = places_tags.tag_id')
            ->where('place_id', $placeId)
            ->findAll();
    }
}
