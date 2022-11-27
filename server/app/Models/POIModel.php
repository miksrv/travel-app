<?php

namespace App\Models;

use CodeIgniter\Model;

class POIModel extends Model
{
    protected $table      = 'poi';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false;
    protected $useSoftDeletes = true;

    protected $allowedFields = [
        'id',
        'overpass_id',
        'category',
        'subcategory',
        'latitude',
        'longitude',
        'tags'
    ];

    protected $useTimestamps = 'datetime';
    protected $createdField  = 'date_create';
    protected $updatedField  = 'date_modify';
    protected $deletedField  = 'date_delete';

    protected $validationRules    = [];
    protected $validationMessages = [];
    protected $skipValidation     = false;

    protected $returnType = \App\Entities\Poi::class;

    protected $beforeInsert = ['tagsToJSON'];
    protected $beforeUpdate = ['tagsToJSON'];
    protected $afterFind = ['JSONToTags'];

    protected function tagsToJSON(array $data): array
    {
        if (! isset($data['data']['tags'])) {
            return $data;
        }

        $data['data']['tags'] = json_encode($data['data']['tags']);

        return $data;
    }

    protected function JSONToTags(array $data)
    {
        if (! isset($data['data']->tags->scalar)) {
            return $data;
        }

        $data['data']->tags = json_decode($data['data']->tags->scalar);

        return $data;
    }
}