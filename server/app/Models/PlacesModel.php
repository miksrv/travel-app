<?php namespace App\Models;

class PlacesModel extends MyBaseModel {
    protected $table      = 'places';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false;

    protected $returnType     = \App\Entities\Place::class;
    protected $useSoftDeletes = true;

    protected array $hiddenFields = ['deleted_at'];

    protected $allowedFields = [
        'category',
        'lat',
        'lon',
        'rating',
        'views',
        'photos',
        'address_en',
        'address_ru',
        'country_id',
        'region_id',
        'district_id',
        'locality_id',
        'user_id',
        'updated_at',
        'created_at'
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'category'    => 'required|string|max_length[50]',
        'lat'         => 'decimal',
        'lon'         => 'decimal',
        'rating'      => 'integer|max_length[1]|greater_than[0]',
        'views'       => 'integer|max_length[10]|greater_than[0]',
        'photos'      => 'integer|max_length[5]',
        'address_en'  => 'string|max_length[250]',
        'address_ru'  => 'string|max_length[250]',
        'country_id'  => 'integer|max_length[5]',
        'region_id'   => 'integer|max_length[5]',
        'district_id' => 'integer|max_length[5]',
        'locality_id' => 'integer|max_length[5]',
        'user_id'     => 'required|string|min_length[3]|max_length[40]',
    ];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = ['beforeInsert'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    protected function beforeInsert(array $data): array {
        $data['data']['id'] = uniqid();

        return $data;
    }

    /**
     * @return object|array|null
     */
    public function getRandomPlaceId(): object|array|null {
        return $this
            ->select('id')
            ->orderBy('id', 'RANDOM')
            ->first();
    }
}