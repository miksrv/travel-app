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
        'comments',
        'bookmarks',
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

    /**
     * @param string $category
     * @return int|string
     */
    public function getCountPlacesByCategory(string $category): int|string {
        return $this
            ->select('id')
            ->where('category', $category)
            ->countAllResults();
    }

    /**
     * @param float $lat
     * @param float $lon
     * @return string
     */
    public function makeDistanceSQL(float $lat, float $lon): string {
        if (!$lat || !$lon) {
            return '';
        }

        return ", 6378 * 2 * ASIN(SQRT(POWER(SIN(($lat - abs(lat)) * pi()/180 / 2), 2) +  COS($lat * pi()/180 ) * COS(abs(lat) * pi()/180) *  POWER(SIN(($lon - lon) * pi()/180 / 2), 2) )) AS distance";
    }

    /**
     * @param string $id
     * @param string $distanceSQL
     * @return array|object|null
     */
    public function getPlaceDataByID(string $id, string $distanceSQL): array|object|null {
        return $this
            ->select('places.id, places.lat, places.lon, places.views, places.photos, places.rating, places.comments, 
                places.bookmarks, ' . $distanceSQL . ', places.updated_at as updated, places.created_at as created, places.category,
                places.country_id, places.region_id, places.district_id, places.locality_id, places.address_ru, places.address_en,
                users.id as user_id, users.name as user_name, users.avatar as user_avatar, users.activity_at,
                location_countries.title_en as country_en, location_countries.title_ru as country_ru, 
                location_regions.title_en as region_en, location_regions.title_ru as region_ru, 
                location_districts.title_en as district_en, location_districts.title_ru as district_ru, 
                location_localities.title_en as city_en, location_localities.title_ru as city_ru,
                category.title_ru as category_ru, category.title_en as category_en')
            ->join('users', 'places.user_id = users.id', 'left')
            ->join('category', 'places.category = category.name', 'left')
            ->join('location_countries', 'location_countries.id = places.country_id', 'left')
            ->join('location_regions', 'location_regions.id = places.region_id', 'left')
            ->join('location_districts', 'location_districts.id = places.district_id', 'left')
            ->join('location_localities', 'location_localities.id = places.locality_id', 'left')
            ->find($id);
    }
}