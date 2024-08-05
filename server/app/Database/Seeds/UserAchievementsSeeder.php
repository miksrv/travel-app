<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class UserAchievementsSeeder extends Seeder {
    private array $insertData = [
        ['Уважаемый человек', '', 0, 0, 0, 0, 100],
        ['Путешественник', '', 30, 0, 0, 0, 0],
        ['Фотолюбитель', '', 0, 0, 50, 0, 0],
    ];

    public function run(): void
    {
        $userAchievementsModel = new UserAchievementsSeeder();
        $tempInsertData = [];

        foreach ($this->insertData as $value) {
            $tempInsertData[] = [
                'name' => $value[0],
                'text' => $value[1],
                'min_count_places' => $value[2],
                'min_count_edits'  => $value[3],
                'min_count_photos' => $value[4],
                'min_count_likes'  => $value[5],
                'min_count_reputation' => $value[6],
            ];
        }

        $userAchievementsModel->insertBatch($tempInsertData);
    }
}
