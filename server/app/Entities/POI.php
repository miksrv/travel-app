<?php namespace App\Entities;

use CodeIgniter\Entity\Entity;

class POI extends Entity
{
    public string $id;
    public int $overpass_id;
}