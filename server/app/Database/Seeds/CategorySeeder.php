<?php namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\CategoryModel;
use ReflectionException;

// https://mapicons.mapsmarker.com/markers/tourism/monuments-structures/arch/?custom_color=e24bbc

class CategorySeeder extends Seeder
{
//    private array $insertData = [
//        ['historic', 'Исторические места', 'Археологические места, затонувшие корабли, руины, замки и старинные здания'],
//        ['tourism', 'Туризм', 'Достопримечательности, места информирования, проживания, помощь во время отдыха'],
//        ['natural', 'Природные образования', 'Этот тег описывает физические особенности земельных областей, их вид, в каком они существуют в природе. Эти типы могут быть отмечены как естественные, даже если они обрабатываются людьми.'],
//        ['man_made', 'Искусственные сооружения', 'Эти теги описывают объекты, которые были созданы исключительно человеком']
//    ];

    private array $insertData = [
        ['battlefield', 'Место сражения', 'Места исторических военных сражений, стычек или любых отметин, которые остались на местах битв. К такому типу относятся окопы, военные полигоны, воронки от бомб или места испытания различных видов вооружений.'],
        ['fort', 'Укрепление', 'Военный форт, ДОТы и ДЗОТы, укрепления, отдельно стоящие оборонительные сооружения, которые имеют историческое значение.'],
        ['transport', 'Техника на постаменте', 'Любая одиночная техника, которая обычно установлена на постоянном месте. К такой технике относится любая военная, гражданская техника, а также железнодорожный, воздушный или морской транспорт.'],
        ['abandoned', 'Заброшенное', 'Любые заброшенные или разрушенные строения, комплексы и т.п, имеющие любое значение.'],
        ['mine', 'Шахта', 'Шахта, рудник, разрез, карьер, прииск.'],
        ['factory', 'Предприятие', 'Промышленные строения, заводы, фабрики, которые имеют какое-либо историческое значение, поддерживается рабочее состояние и можно посетить с экскурсией.'],
        ['construction', 'Инженерная структура', 'Различные интересные инженерные структуры, например мельницы, маяки, обсерватории, мельницы, антенны и т.п.'],

        ['memorial', 'Памятник', 'Памятники, обычно, в честь конкретных людей, народов потерявших свои жизни в мировых войнах.'],
        ['monument', 'Монумент', 'Очень большой мемориальный объект, который был построен чтобы помнить, выражать уважение к человеку или группе людей или служить напоминанием о событии.'],
        ['museum', 'Музей', 'Учреждение, в котором есть выставки научных, исторических, художественных или культурных артефактов.'],
        ['castle', 'Крепость', 'Различные виды замков, дворцов, крепостей, усадеб, величественных домов, кремлей, сиро и других.'],
        ['manor', 'Историческое здание', 'Исторические поместья, усадьбы, фермы, сохранившиеся в первоначальном состоянии и связанные с известными историческими личностями.'],
        ['religious', 'Религиозное сооружение', 'Церковь, мечеть, монастырь, часовня или храм с историческим значением. Сюда относятся различные действующие религиозные постройки разных конфессий.'],
        ['archeology', 'Археология', 'Различные места проведения раскопок, древние городища, дольмены, места стоянки первобытных людей и тому подобное.'],

        ['cave', 'Пещера', 'Вход в пещеру, небольшой грот или карстовые провалы, куда можно залезть.'],
        ['waterfall', 'Водопад', 'Приодные водопады.'],
        ['spring', 'Родник', 'Источники питьевой воды, родники.'],
        ['nature', 'Природный объект', 'Интересные природные объекты - лощины, долины, ущелья.'],
        ['water', 'Водоем', 'Озеро, водохранилище или любой водоем, например где можно рыбачить или отдыхать.'],
        ['mountain', 'Гора', 'Утёсы, отвесные скалы, скалы, горные вершины.'],
        ['camping', 'Кемпинг', 'Кемпинг, палаточный городок (место, где люди могут ночевать в палатках, автофургонах или домах на колёсах).'],
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
