<?php namespace App\Database\Seeds;

use App\Models\OverpassCategoryModel;
use CodeIgniter\Database\Seeder;
use ReflectionException;

class OverpassCategorySeeder extends Seeder
{
    private array $insertData = [
        ['historic', 'aircraft', 'aircraft', 'Самолет', 'transport'],
        ['historic', 'anchor', 'water_transport', 'Якорь', 'transport'],
        ['historic', 'archaeological_site', 'archeology', 'Археология', 'archeology'],
        ['historic', 'battlefield', 'battlefield', 'Место битвы', 'battlefield'],
        ['historic', 'bomb_crater', 'military_training', 'Воронка от бомбы', 'battlefield'],
        ['historic', 'boundary_stone', null, 'Геодезический маркер', null],
        ['historic', 'building', 'manor', 'Историческое здание', 'manor'],
        ['historic', 'cannon', 'military_equipment', 'Пушка', 'transport'],
        ['historic', 'castle', 'castle', 'Замок', 'castle'],
        ['historic', 'charcoal_pile', null, 'Древесный уголь', ''],
        ['historic', 'church', 'religious', 'Церковь', 'religious'],
        ['historic', 'city_gate', 'castle', 'Городские ворота', 'manor'],
        ['historic', 'farm', 'farm', 'Ферма', 'manor'],
        ['historic', 'fort', 'fort', 'Военный форт', 'fort'],
        ['historic', 'gallows', null, 'Остатки виселицы', null],
        ['historic', 'highwater_mark', null, 'Маркер наводнения', null],
        ['historic', 'locomotive', 'railroad_transport', 'Локомотив', 'transport'],
        ['historic', 'manor', 'manor', 'Поместье', 'manor'],
        ['historic', 'memorial', 'memorial', 'Памятник', 'memorial'],
        ['historic', 'milestone', null, 'Указатель расстояния', null],
        ['historic', 'monastery', 'religious', 'Монастырь', 'religious'],
        ['historic', 'monument', 'monument', 'Монумент', 'monument'],
        ['historic', 'ruins', 'ruins', 'Руины', 'abandoned'],
        ['historic', 'rune_stone', 'petroglyph', 'Петроглиф', 'archeology'],
        ['historic', 'ship', 'water_transport', 'Корабль', 'transport'],
        ['historic', 'tank', 'military_equipment', 'Танк', 'transport'],
        ['historic', 'tomb', 'tomb', 'Могильный камень', 'religious'],
        ['historic', 'tower', 'tower', 'Башня', 'construction'],
        ['historic', 'vehicle', 'civil_transport', 'Транспорт', 'transport'],
        ['historic', 'wayside_cross', 'wayside_shrine', 'Поклонный крест', 'religious'],
        ['historic', 'wayside_shrine', 'wayside_shrine', 'Святыня', 'religious'],
        ['historic', 'wreck', 'wreck', 'Затонувшее судно', 'abandoned'],
        ['tourism', 'alpine_hut', 'wilderness_hut', 'Горный приют', 'camping'],
        ['tourism', 'aquarium', 'aquarium', 'Океанариум', 'museum'],
        ['tourism', 'artwork', 'artwork', 'Паблик-арт', 'museum'],
        ['tourism', 'attraction', 'attraction', 'Достопримечательность', 'monument'],
        ['tourism', 'camp_pitch', 'camping', 'Место для палатки', 'camping'],
        ['tourism', 'camp_site', 'camping', 'Кемпинг', 'camping'],
        ['tourism', 'caravan_site', 'camping', 'Место для караванов', 'camping'],
        ['tourism', 'gallery', 'gallery', 'Художественная галерея', 'museum'],
        ['tourism', 'guest_house', 'hotel', 'Гостевой дом', 'camping'],
        ['tourism', 'hostel', 'hotel', 'Хостел', 'camping'],
        ['tourism', 'hotel', 'hotel', 'Гостиница', 'camping'],
        ['tourism', 'motel', 'hotel', 'Мотель', 'camping'],
        ['tourism', 'museum', 'museum', 'Музей', 'museum'],
        ['tourism', 'picnic_site', 'picnic_site', 'Место для пикника', 'camping'],
        ['tourism', 'theme_park', 'theme_park', 'Парк развлечений', 'museum'],
        ['tourism', 'viewpoint', 'viewpoint', 'Смотровая площадка', 'monument'],
        ['tourism', 'wilderness_hut', 'wilderness_hut', 'Лесной домик', 'camping'],
        ['tourism', 'zoo', 'zoo', 'Зоопарк', 'museum'],
        ['natural', 'hill', 'hill', 'Холм', 'mountain'],
        ['natural', 'bay', 'bay', 'Залив', 'nature'],
        ['natural', 'blowhole', 'cave_entrance', 'Воющая дыра', 'nature'],
        ['natural', 'cape', 'rock', 'Мыс', 'nature'],
        ['natural', 'geyser', 'geyser', 'Гейзер', 'nature'],
        ['natural', 'glacier', 'glacier', 'Ледник', 'nature'],
        ['natural', 'hot_spring', 'hot_spring', 'Горячий источник', 'nature'],
        ['natural', 'spring', 'spring', 'Родник', 'spring', 'nature'],
        ['natural', 'arch', 'arch', 'Скальная арка', 'mountain'],
        ['natural', 'cliff', 'rock', 'Утёс', 'mountain'],
        ['natural', 'fumarole', 'geyser', 'Фумарола', 'nature'],
        ['natural', 'peak', 'peak', 'Горная вершина', 'mountain'],
        ['natural', 'rock', 'rock', 'Скала', 'mountain'],
        ['natural', 'saddle', 'rock', 'Седловина между холмов', 'mountain'],
        ['natural', 'sand', 'sand', 'Пустыня', 'nature'],
        ['natural', 'sinkhole', 'sinkhole', 'Воронка', 'nature'],
        ['natural', 'stone', 'rock', 'Валун или камень', 'nature'],
        ['natural', 'volcano', 'volcano', 'Вулкан', 'mountain'],
        ['man_made', 'adit', 'mine', 'Штольня', 'mine'],
        ['man_made', 'antenna', 'antenna', 'Антенна', 'construction'],
        ['man_made', 'cellar_entrance', null, 'Вход в склеп', 'religious'],
        ['man_made', 'chimney', null, 'Дымовая труба', 'construction'],
        ['man_made', 'communications_tower', 'antenna', 'Радиовышка', 'construction'],
        ['man_made', 'crane', null, 'Подъемный кран', 'construction'],
        ['man_made', 'cross', null, 'Крест', 'religious'],
        ['man_made', 'flagpole', null, 'Флагшток', 'construction'],
        ['man_made', 'kiln', null, 'Печь', 'construction'],
        ['man_made', 'lighthouse', 'lighthouse', 'Маяк', 'construction'],
        ['man_made', 'mineshaft', 'mine', 'Ствол шахты', 'mine'],
        ['man_made', 'obelisk', null, 'Обелиск', 'monument'],
        ['man_made', 'observatory', 'observatory', 'Обсерватория', 'construction'],
        ['man_made', 'offshore_platform', 'drilling', 'Морская буровая платформа', 'construction'],
        ['man_made', 'petroleum_well', 'drilling', 'Буровая', 'construction'],
        ['man_made', 'satellite_dish', 'satellite_dish', 'Спутниковая антенна', 'construction'],
        ['man_made', 'telescope', 'observatory', 'Телескоп', 'construction'],
        ['man_made', 'tower', null, 'Башня', 'construction'],
        ['man_made', 'water_tap', 'water_tap', 'Колонка', 'spring'],
        ['man_made', 'water_tower', null, 'Водонапорная башня', 'construction'],
        ['man_made', 'water_well', 'water_tap', 'Колодец', 'spring'],
        ['man_made', 'watermill', 'mill', 'Водяная мельница', 'construction'],
        ['man_made', 'windmill', 'mill', 'Ветряная мельница', 'construction'],
        ['man_made', 'windpump', 'water_tap', 'Водяной насос', 'construction'],
        ['man_made', 'works', 'factory', 'Промышленные строения, заводы, фабрики', 'factory'],
    ];

    /**
     * @throws ReflectionException
     */
    public function run() {
        $CategoryModel  = new OverpassCategoryModel();
        $tempInsertData = [];

        foreach ($this->insertData as $value) {
            $tempInsertData[] = [
                'category'     => $value[0],
                'name'         => $value[1],
                'subcategory'  => $value[2],
                'title'        => $value[3],
                'category_map' => $value[4],
            ];
        }

        $CategoryModel->insertBatch($tempInsertData);
    }
}
