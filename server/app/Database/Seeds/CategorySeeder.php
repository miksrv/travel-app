<?php namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\CategoryModel;

class CategorySeeder extends Seeder
{
    private array $insertData = [
        [
            'name'  => 'historic',
            'title' => 'Исторические места',
            'info'  => 'Археологические места, затонувшие корабли, руины, замки и старинные здания',
        ],
    ];

    public function run()
    {
        $CategoryModel = new CategoryModel();

        $CategoryModel->insertBatch($this->insertData);
    }
}
