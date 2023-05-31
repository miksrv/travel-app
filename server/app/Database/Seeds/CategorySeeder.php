<?php namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\CategoryModel;
use ReflectionException;

class CategorySeeder extends Seeder
{
    private array $insertData = [
        ['historic', 'Исторические места', 'Археологические места, затонувшие корабли, руины, замки и старинные здания'],
        ['tourism', 'Туризм', 'Достопримечательности, места информирования, проживания, помощь во время отдыха'],
        ['natural', 'Природные образования', 'Этот тег описывает физические особенности земельных областей, их вид, в каком они существуют в природе. Эти типы могут быть отмечены как естественные, даже если они обрабатываются людьми.'],
        ['man_made', 'Искусственные сооружения', 'Эти теги описывают объекты, которые были созданы исключительно человеком']
    ];

    /**
     * @throws ReflectionException
     */
    public function run()
    {
        $CategoryModel  = new CategoryModel();
        $tempInsertData = [];

        foreach ($this->insertData as $value) {
            $tempInsertData[] = [
                'name'  => $value[0],
                'title' => $value[1],
                'info'  => $value[2],
            ];
        }

        $CategoryModel->insertBatch($tempInsertData);
    }
}
