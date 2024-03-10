<?php namespace App\Models;

class TagsModel extends MyBaseModel {
    protected $table            = 'tags';
    protected $primaryKey       = 'id';

    protected $useAutoIncrement = false;

    protected $returnType       = \App\Entities\Tag::class;
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'title_en',
        'title_ru',
        'count'
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
     * @param string $title
     * @return array|object|null
     */
    public function getTagsByTitle(string $title): object|array|null {
        return $this
            ->select('id, count')
            ->where('title_ru', $title)
            ->orWhere('title_en', $title)
            ->first();
    }
}
