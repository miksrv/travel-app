<?php namespace App\Models;

use App\Entities\Place;
use CodeIgniter\Model;

class PlacesModel extends Model
{
    protected $table      = 'places';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false;

    protected $returnType     = Place::class;
    protected $useSoftDeletes = true;

    // The updatable fields
    protected $allowedFields = [
        'overpass_id',
        'category',
        'subcategory',
        'title',
        'content',
        'address',
        'address_country',
        'address_region',
        'address_district',
        'address_city',
        'latitude',
        'longitude',
        'author',
        'rating',
        'views',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'category'    => 'required|integer|max_length[2]|greater_than[0]',
        'subcategory' => 'integer|max_length[2]|greater_than[0]',
        'title'       => 'required|string|min_length[3]|max_length[200]',
        'content'     => 'string',
        'address'     => 'string|max_length[250]',
        'address_country'  => 'integer|max_length[5]',
        'address_province' => 'integer|max_length[5]',
        'address_area'     => 'integer|max_length[5]',
        'address_city'     => 'integer|max_length[5]',
        'latitude'  => 'decimal',
        'longitude' => 'decimal',
        'author'    => 'string|max_length[40]',
        'name'      => 'required|string|min_length[3]|max_length[40]',
        'rating'    => 'integer|max_length[1]|greater_than[0]',
        'views'     => 'integer|max_length[5]|greater_than[0]'
    ];
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
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    protected function beforeInsert(array $data): array
    {
        $data['data']['id'] = uniqid();

        return $data;
    }
}