<?php

namespace App\Database\Seeds;

use App\Models\UsersLevelsModel;
use CodeIgniter\Database\Seeder;

class UserLevelsSeeder extends Seeder {
    private array $insertData = [
        [1,  0,     'Novice Traveler',           'Начинающий путешественник'],
        [2,  50,    'Discoverer',                'Открыватель'],
        [3,  100,   'Novice Tourist',            'Турист-новичок'],
        [4,  200,   'Excursionist',              'Экскурсант'],
        [5,  350,   'Researcher',                'Исследователь'],
        [6,  500,   'Tourist 1st class',         'Турист 1 класса'],
        [8,  1000,  'Guide',                     'Экскурсовод'],
        [9,  1300,  'Guide 1st class',           'Экскурсовод 1 класса'],
        [10, 1700,  'Guide 2nd class',           'Экскурсовод 2 класса'],
        [11, 2200,  'Expert',                    'Эксперт'],
        [12, 2800,  'Professional Guide',        'Профи экскурсовод'],
        [13, 3500,  'Adventurer',                'Авантюрист'],
        [14, 4300,  'Expert 1st class',          'Эксперт 1 класса'],
        [15, 5200,  'Tourist Scout',             'Турист-разведчик'],
        [16, 6200,  'Traveler',                  'Путешественник'],
        [17, 7300,  'Globetrotter',              'Глобетроттер'],
        [18, 8500,  'Frequenter',                'Завсегдатай'],
        [19, 9800,  'Cultural Researcher',       'Культурный исследователь'],
        [20, 11200, 'Natural Explorer',          'Природный исследователь'],
        [21, 12700, 'Architectural Guru',        'Архитектурный гуру'],
        [22, 14300, 'Gourmet Traveler',          'Гурман-путешественник'],
        [23, 16000, 'Amateur Photographer',      'Фотограф-любитель'],
        [24, 17800, 'Professional Photographer', 'Фотограф-профессионал'],
        [25, 19700, 'Mountain Climber',          'Горный альпинист'],
        [26, 21700, 'Sandy Aficionado',          'Песчаный афиционадо'],
        [27, 23800, 'Underwater Explorer',       'Подводный исследователь'],
        [28, 23800, 'Master Guide',              'Мастер экскурсовод'],
        [29, 23800, 'Travel Writer',             'Туристический автор'],
        [30, 30700, 'Global Guide',              'Глобальный гид'],
    ];

    public function run(): void {
        $userLevelsModel = new UsersLevelsModel();
        $tempInsertData  = [];

        foreach ($this->insertData as $value) {
            $tempInsertData[] = [
                'level'      => $value[0],
                'experience' => $value[1],
                'title_en'   => $value[2],
                'title_ru'   => $value[3],
            ];
        }

        $userLevelsModel->insertBatch($tempInsertData);
    }
}
