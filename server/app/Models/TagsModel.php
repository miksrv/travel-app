<?php

namespace App\Models;

class TagsModel extends ApplicationBaseModel {
    protected $table            = 'tags';
    protected $primaryKey       = 'id';
    protected $returnType       = \App\Entities\TagEntity::class;
    protected $useAutoIncrement = false;
    protected $useSoftDeletes   = false;

    protected array $hiddenFields = [
        'created_at',
        'deleted_at'
    ];

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
    protected $beforeInsert   = ['generateId'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * @param string $title
     * @return array|object|null
     */
    public function getTagsByTitle(string $title): object|array|null
    {
        return $this
            ->select('id, count')
            ->where('title_ru', $title)
            ->orWhere('title_en', $title)
            ->first();
    }
}
