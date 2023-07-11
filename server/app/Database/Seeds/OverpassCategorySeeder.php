<?php namespace App\Database\Seeds;

use App\Models\OverpassCategoryModel;
use CodeIgniter\Database\Seeder;
use ReflectionException;

class OverpassCategorySeeder extends Seeder
{
    private array $insertData = [
        ['historic', 'aircraft', 'aircraft', 'Самолет'],
        ['historic', 'anchor', 'water_transport', 'Якорь'],
        ['historic', 'archaeological_site', 'archeology', 'Археология'],
        ['historic', 'battlefield', 'battlefield', 'Место битвы'],
        ['historic', 'bomb_crater', 'military_training', 'Воронка от бомбы'],
        ['historic', 'boundary_stone', null, 'Геодезический маркер'],
        ['historic', 'building', 'manor', 'Историческое здание'],
        ['historic', 'cannon', 'military_equipment', 'Пушка'],
        ['historic', 'castle', 'castle', 'Замок'],
        ['historic', 'charcoal_pile', null, 'Древесный уголь'],
        ['historic', 'church', 'religious', 'Церковь'],
        ['historic', 'city_gate', 'castle', 'Городские ворота'],
        ['historic', 'farm', 'farm', 'Ферма'],
        ['historic', 'fort', 'fort', 'Военный форт'],
        ['historic', 'gallows', null, 'Остатки виселицы'],
        ['historic', 'highwater_mark', null, 'Маркер наводнения'],
        ['historic', 'locomotive', 'railroad_transport', 'Локомотив'],
        ['historic', 'manor', 'manor', 'Поместье'],
        ['historic', 'memorial', 'memorial', 'Памятник'],
        ['historic', 'milestone', null, 'Указатель расстояния'],
        ['historic', 'monastery', 'religious', 'Монастырь'],
        ['historic', 'monument', 'monument', 'Монумент'],
        ['historic', 'ruins', 'ruins', 'Руины'],
        ['historic', 'rune_stone', 'petroglyph', 'Петроглиф'],
        ['historic', 'ship', 'water_transport', 'Корабль'],
        ['historic', 'tank', 'military_equipment', 'Танк'],
        ['historic', 'tomb', 'tomb', 'Могильный камень'],
        ['historic', 'tower', 'tower', 'Башня'],
        ['historic', 'vehicle', 'civil_transport', 'Транспорт'],
        ['historic', 'wayside_cross', 'wayside_shrine', 'Поклонный крест'],
        ['historic', 'wayside_shrine', 'wayside_shrine', 'Святыня'],
        ['historic', 'wreck', 'wreck', 'Затонувшее судно'],
        ['tourism', 'alpine_hut', 'wilderness_hut', 'Горный приют'],
        ['tourism', 'aquarium', 'aquarium', 'Океанариум'],
        ['tourism', 'artwork', 'artwork', 'Паблик-арт'],
        ['tourism', 'attraction', 'attraction', 'Достопримечательность'],
        ['tourism', 'camp_pitch', 'camping', 'Место для палатки'],
        ['tourism', 'camp_site', 'camping', 'Кемпинг'],
        ['tourism', 'caravan_site', 'camping', 'Место для караванов'],
        ['tourism', 'gallery', 'gallery', 'Художественная галерея'],
        ['tourism', 'guest_house', 'hotel', 'Гостевой дом'],
        ['tourism', 'hostel', 'hotel', 'Хостел'],
        ['tourism', 'hotel', 'hotel', 'Гостиница'],
        ['tourism', 'motel', 'hotel', 'Мотель'],
        ['tourism', 'museum', 'museum', 'Музей'],
        ['tourism', 'picnic_site', 'picnic_site', 'Место для пикника'],
        ['tourism', 'theme_park', 'theme_park', 'Парк развлечений'],
        ['tourism', 'viewpoint', 'viewpoint', 'Смотровая площадка'],
        ['tourism', 'wilderness_hut', 'wilderness_hut', 'Лесной домик'],
        ['tourism', 'zoo', 'zoo', 'Зоопарк'],
        ['natural', 'hill', 'hill', 'Холм'],
        ['natural', 'bay', 'bay', 'Залив'],
        ['natural', 'blowhole', 'cave_entrance', 'Воющая дыра'],
        ['natural', 'cape', 'rock', 'Мыс'],
        ['natural', 'geyser', 'geyser', 'Гейзер'],
        ['natural', 'glacier', 'glacier', 'Ледник'],
        ['natural', 'hot_spring', 'hot_spring', 'Горячий источник'],
        ['natural', 'spring', 'spring', 'Родник'],
        ['natural', 'arch', 'arch', 'Скальная арка'],
        ['natural', 'cliff', 'rock', 'Утёс'],
        ['natural', 'fumarole', 'geyser', 'Фумарола'],
        ['natural', 'peak', 'peak', 'Горная вершина'],
        ['natural', 'rock', 'rock', 'Скала'],
        ['natural', 'saddle', 'rock', 'Седловина между холмов'],
        ['natural', 'sand', 'sand', 'Пустыня'],
        ['natural', 'sinkhole', 'sinkhole', 'Воронка'],
        ['natural', 'stone', 'rock', 'Валун или камень'],
        ['natural', 'volcano', 'volcano', 'Вулкан'],
        ['man_made', 'adit', 'mine', 'Штольня'],
        ['man_made', 'antenna', 'antenna', 'Антенна'],
        ['man_made', 'cellar_entrance', null, 'Вход в склеп'],
        ['man_made', 'chimney', null, 'Дымовая труба'],
        ['man_made', 'communications_tower', 'antenna', 'Радиовышка'],
        ['man_made', 'crane', null, 'Подъемный кран'],
        ['man_made', 'cross', null, 'Крест'],
        ['man_made', 'flagpole', null, 'Флагшток'],
        ['man_made', 'kiln', null, 'Печь'],
        ['man_made', 'lighthouse', 'lighthouse', 'Маяк'],
        ['man_made', 'mineshaft', 'mine', 'Ствол шахты'],
        ['man_made', 'obelisk', null, 'Обелиск'],
        ['man_made', 'observatory', 'observatory', 'Обсерватория'],
        ['man_made', 'offshore_platform', 'drilling', 'Морская буровая платформа'],
        ['man_made', 'petroleum_well', 'drilling', 'Буровая'],
        ['man_made', 'satellite_dish', 'satellite_dish', 'Спутниковая антенна'],
        ['man_made', 'telescope', 'observatory', 'Телескоп'],
        ['man_made', 'tower', null, 'Башня'],
        ['man_made', 'water_tap', 'water_tap', 'Колонка'],
        ['man_made', 'water_tower', null, 'Водонапорная башня'],
        ['man_made', 'water_well', 'water_tap', 'Колодец'],
        ['man_made', 'watermill', 'mill', 'Водяная мельница'],
        ['man_made', 'windmill', 'mill', 'Ветряная мельница'],
        ['man_made', 'windpump', 'water_tap', 'Водяной насос'],
        ['man_made', 'works', 'factory', 'Промышленные строения, заводы, фабрики'],
    ];

    /**
     * @throws ReflectionException
     */
    public function run()
    {
        $CategoryModel  = new OverpassCategoryModel();
        $tempInsertData = [];

        foreach ($this->insertData as $value) {
            $tempInsertData[] = [
                'category'    => $value[0],
                'name'        => $value[1],
                'subcategory' => $value[2],
                'title'       => $value[3]
            ];
        }

        $CategoryModel->insertBatch($tempInsertData);
    }
}
