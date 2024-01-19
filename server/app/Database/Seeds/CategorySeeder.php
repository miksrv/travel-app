<?php namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\CategoryModel;
use ReflectionException;

class CategorySeeder extends Seeder {
    private array $insertData = [
        [
            'name'       => 'battlefield',
            'title_en'   => 'Battle site',
            'title_ru'   => 'Место сражения',
            'content_en' => 'Sites of historical military battles, skirmishes, or any marks that remain at battle sites. This type includes trenches, military training grounds, bomb craters or places where various types of weapons are tested.',
            'content_ru' => 'Места исторических военных сражений, стычек или любых отметин, которые остались на местах битв. К такому типу относятся окопы, военные полигоны, воронки от бомб или места испытания различных видов вооружений.'
        ],
        [
            'name'       => 'fort',
            'title_en'   => 'Bunker',
            'title_ru'   => 'Укрепление',
            'content_en' => 'Military fort, bunkers and bunkers, fortifications, free-standing defensive structures that have historical significance.',
            'content_ru' => 'Военный форт, ДОТы и ДЗОТы, укрепления, отдельно стоящие оборонительные сооружения, которые имеют историческое значение.'
        ],
        [
            'name'       => 'transport',
            'title_en'   => 'Equipment on a pedestal',
            'title_ru'   => 'Техника на постаменте',
            'content_en' => 'Any single piece of equipment that is usually installed in a permanent location. This type of equipment includes any military, civilian equipment, as well as railway, air or sea transport.',
            'content_ru' => 'Любая одиночная техника, которая обычно установлена на постоянном месте. К такой технике относится любая военная, гражданская техника, а также железнодорожный, воздушный или морской транспорт.'
        ],
        [
            'name'       => 'abandoned',
            'title_en'   => 'Abandoned',
            'title_ru'   => 'Заброшенное',
            'content_en' => 'Any abandoned or destroyed buildings, complexes, etc., of any significance.',
            'content_ru' => 'Любые заброшенные или разрушенные строения, комплексы и т.п, имеющие любое значение.'
        ],
        [
            'name'       => 'mine',
            'title_en'   => 'Mine',
            'title_ru'   => 'Шахта',
            'content_en' => 'Mine, mine, open pit, quarry, mine.',
            'content_ru' => 'Шахта, рудник, разрез, карьер, прииск.'
        ],
        [
            'name'       => 'factory',
            'title_en'   => 'Factory',
            'title_ru'   => 'Предприятие',
            'content_en' => 'Industrial buildings, plants, factories that have any historical significance are maintained in working condition and can be visited on a guided tour.',
            'content_ru' => 'Промышленные строения, заводы, фабрики, которые имеют какое-либо историческое значение, поддерживается рабочее состояние и можно посетить с экскурсией.'
        ],
        [
            'name'       => 'construction',
            'title_en'   => 'Engineering structure',
            'title_ru'   => 'Инженерная структура',
            'content_en' => 'Various interesting engineering structures, such as mills, lighthouses, observatories, windmills, antennas, etc.',
            'content_ru' => 'Различные интересные инженерные структуры, например мельницы, маяки, обсерватории, мельницы, антенны и т.п.'
        ],
        [
            'name'       => 'memorial',
            'title_en'   => 'Monument',
            'title_ru'   => 'Памятник',
            'content_en' => 'Monuments are usually in honor of specific people, peoples who lost their lives in world wars.',
            'content_ru' => 'Памятники, обычно, в честь конкретных людей, народов потерявших свои жизни в мировых войнах.'
        ],
        [
            'name'       => 'monument',
            'title_en'   => 'Monument',
            'title_ru'   => 'Монумент',
            'content_en' => 'A very large memorial object that was built to remember, pay respect to a person or group of people, or serve as a reminder of an event.',
            'content_ru' => 'Очень большой мемориальный объект, который был построен чтобы помнить, выражать уважение к человеку или группе людей или служить напоминанием о событии.'
        ],
        [
            'name'       => 'museum',
            'title_en'   => 'Museum',
            'title_ru'   => 'Музей',
            'content_en' => 'An institution that has exhibitions of scientific, historical, artistic or cultural artifacts.',
            'content_ru' => 'Учреждение, в котором есть выставки научных, исторических, художественных или культурных артефактов.'
        ],
        [
            'name'       => 'castle',
            'title_en'   => 'Fortress',
            'title_ru'   => 'Крепость',
            'content_en' => 'Various types of castles, palaces, fortresses, estates, stately houses, kremlins, shiro and others.',
            'content_ru' => 'Различные виды замков, дворцов, крепостей, усадеб, величественных домов, кремлей, сиро и других.'
        ],
        [
            'name'       => 'manor',
            'title_en'   => 'Historical building',
            'title_ru'   => 'Историческое здание',
            'content_en' => 'Historic estates, manors, farms, preserved in their original condition and associated with famous historical figures.',
            'content_ru' => 'Исторические поместья, усадьбы, фермы, сохранившиеся в первоначальном состоянии и связанные с известными историческими личностями.'
        ],
        [
            'name'       => 'religious',
            'title_en'   => 'Religious building',
            'title_ru'   => 'Религиозное сооружение',
            'content_en' => 'Church, mosque, monastery, chapel or temple of historical significance. This includes various active religious buildings of different faiths.',
            'content_ru' => 'Церковь, мечеть, монастырь, часовня или храм с историческим значением. Сюда относятся различные действующие религиозные постройки разных конфессий.'
        ],
        [
            'name'       => 'archeology',
            'title_en'   => 'Archeology',
            'title_ru'   => 'Археология',
            'content_en' => 'Various excavation sites, ancient settlements, dolmens, sites of primitive people and the like.',
            'content_ru' => 'Различные места проведения раскопок, древние городища, дольмены, места стоянки первобытных людей и тому подобное.'
        ],

        [
            'name'       => 'cave',
            'title_en'   => 'Cave',
            'title_ru'   => 'Пещера',
            'content_en' => 'The entrance to a cave, a small grotto or karst sinkhole, where you can climb.',
            'content_ru' => 'Вход в пещеру, небольшой грот или карстовые провалы, куда можно залезть.'
        ],
        [
            'name'       => 'waterfall',
            'title_en'   => 'Waterfall',
            'title_ru'   => 'Водопад',
            'content_en' => 'Coastal waterfalls.',
            'content_ru' => 'Приодные водопады.'
        ],
        [
            'name'       => 'spring',
            'title_en'   => 'Spring',
            'title_ru'   => 'Родник',
            'content_en' => 'Sources of drinking water, springs.',
            'content_ru' => 'Источники питьевой воды, родники.'
        ],
        [
            'name'       => 'nature',
            'title_en'   => 'Природный объектNatural object',
            'title_ru'   => 'Природный объект',
            'content_en' => 'Interesting natural objects - dells, valleys, gorges.',
            'content_ru' => 'Интересные природные объекты - лощины, долины, ущелья.'
        ],
        [
            'name'       => 'water',
            'title_en'   => 'Water',
            'title_ru'   => 'Водоем',
            'content_en' => 'A lake, reservoir or any body of water, for example where you can fish or relax.',
            'content_ru' => 'Озеро, водохранилище или любой водоем, например где можно рыбачить или отдыхать.'
        ],
        [
            'name'       => 'mountain',
            'title_en'   => 'Mountain',
            'title_ru'   => 'Гора',
            'content_en' => 'Cliffs, sheer cliffs, cliffs, mountain peaks.',
            'content_ru' => 'Утёсы, отвесные скалы, скалы, горные вершины.'
        ],
        [
            'name'       => 'camping',
            'title_en'   => 'Camping',
            'title_ru'   => 'Кемпинг',
            'content_en' => 'Camping, tent city (a place where people can spend the night in tents, RVs or mobile homes).',
            'content_ru' => 'Кемпинг, палаточный городок (место, где люди могут ночевать в палатках, автофургонах или домах на колёсах).'
        ],
    ];

    /**
     * @throws ReflectionException
     */
    public function run(): void {
        $categoryModel = new CategoryModel();

        foreach ($this->insertData as $value) {
            $categoryModel->insert([
                'name'       => $value['name'],
                'title_en'   => $value['title_en'],
                'title_ru'   => $value['title_ru'],
                'content_en' => $value['content_en'],
                'content_ru' => $value['content_ru'],
            ]);
        }
    }
}
