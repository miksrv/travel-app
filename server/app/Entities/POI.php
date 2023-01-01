<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class POI extends Entity
{
    protected $casts = [
        'overpass_id' => 'integer',
        'category'    => 'integer',
        'subcategory' => 'integer',
        'longitude'   => 'float',
        'latitude'    => 'float',
        'tags'        => 'object',
        'name'        => 'string'
    ];

    public function setTags(object $tags)
    {
        $this->attributes['tags'] = json_encode($tags);

        return $this;
    }

    public function getTags()
    {
        return json_decode($this->attributes['tags'], true);
    }
}