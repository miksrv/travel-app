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
    ];

//    public function setTags(object $tags)
//    {
//        $this->attributes['tags'] = json_encode($tags);
//
//        return $this;
//    }

//    public function getTags()
//    {
//        $this->attributes['tags'] = json_decode($this->attributes['tags'], true);
//
//        return $this;
//    }
}