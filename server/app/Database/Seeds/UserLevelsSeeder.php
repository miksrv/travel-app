<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class UserLevelsSeeder extends Seeder {
    private array $insertData = [
        ['Путешественник', '', 1, 0],
        ['Открыватель', '', 2, 50],
        ['Турист-новичок', '', 3, 100],
        ['Экскурсант', '', 4, 150],
        ['Исследователь', '', 5, 200],
        ['Турист 1 класса', '', 6, 250],
        ['Экскурсовод', '', 7, 300],
        ['Профессиональный экскурсовод', '', 8, 350],
        ['Экскурсовод 1 класса', '', 9, 400],
        ['Экскурсовод 2 класса', '', 10, 450],
        ['Эксперт', '', 11, 500],
        ['Мастер экскурсовод', '', 12, 550],
        ['Авантюрист', '', 13, 600],
        ['Эксперт 1 класса', '', 14, 650],
        ['Турист-разведчик', '', 15, 700],
    ];

    public function run(): void {
        $userLevelsModel = new UserLevelsSeeder();
        $tempInsertData  = [];

        foreach ($this->insertData as $value) {
            $tempInsertData[] = [
                'name'  => $value[0],
                'text'  => $value[1],
                'level' => $value[2],
                'experience' => $value[3],
            ];
        }

        $userLevelsModel->insertBatch($tempInsertData);
    }
}
