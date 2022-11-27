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
        'longitude'
    ];

    protected $useTimestamps = 'datetime';
    protected $createdField  = 'date_create';
    protected $updatedField  = 'date_modify';
    protected $deletedField  = 'date_delete';

    protected $validationRules    = [];
    protected $validationMessages = [];
    protected $skipValidation     = false;

    protected $returnType = \App\Entities\Poi::class;
}