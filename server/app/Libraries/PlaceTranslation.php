<?php namespace App\Libraries;

use App\Models\SessionsHistoryModel;
use App\Models\SessionsModel;
use App\Models\TranslationsPlacesModel;
use Config\Services;
use ReflectionException;

/**
 * Class for find actual translation for place
 *
 * Как работать:
 *
 * 1) Импортируем:
 *    $placeTranslations = new PlaceTranslation('ru', 350);
 *    ru - язык (сообщает клиент, если такого языка нет, будет выводится любой), 350 - обрезает контент
 * 2) Находим перевод для объектов:
 *    A: Если используется поиск $placeTranslations->search('кратер');
 *    B: Если уже известен массив объектов: $placeTranslations->translate([{ID}, {ID}]);
 * 3) Для того, чтобы вернуть ID всех найденных объектов: $placeTranslations->placeIds;
 * 4) Перевод для каждого конкретного:
 *    А: Заголовок $placeTranslations->title({ID});
 *    B: Контент $placeTranslations->content({ID});
 */
class PlaceTranslation {

    protected array $translate = [];
    public array $placeIds = [];
    protected string $language = 'ru';
    protected int $trim;
    protected string $search;

    private TranslationsPlacesModel $model;

    /**
     * При вызове конструктора устанавливаем параметры и начинаем работать с моделью.
     * Библиотека работает в двух режимах:
     *  1) Поиск по ключевому слову и возвращение списка ID мест и контента для каждого
     *  2) Получает список ID мест, извлекает для них контент и возвращает его
     * @param string $language
     * @param int $trim
     */
    public function __construct(string $language = 'ru', int $trim = 0) {
        $this->model    = new TranslationsPlacesModel();
        $this->language = $language;
        $this->trim     = $trim;

        $this->model->select(
            'translations_places.place, translations_places.title, translations_places.created_at,' .
            ($this->trim > 0 ? 'SUBSTRING(translations_places.content, 1, ' . $this->trim . ') as content' : 'translations_places.content')
        );
    }

    public function search(string $term): void {
        $this->search = $term;

        $data = $this->model
            ->like('title', $term)
            ->orLike('content', $term)
            ->orderBy('created_at', 'DESC')
            ->findAll();

        $this->_prepareOutput($data);
    }

    public function translate(array $placeIds): void
    {
        $this->placeIds = $placeIds;

        $data = $this->model
            ->whereIn('place', $placeIds)
            ->orderBy('created_at', 'DESC')
            ->findAll();

        $this->_prepareOutput($data);
    }

    /**
     * Return title for place by ID
     * @param string $placeId
     * @return string
     */
    public function title(string $placeId): string {
        if (isset($this->translate[$placeId])) {
            return $this->translate[$placeId]->title;
        }

        return '';
    }

    /**
     * Return title for place by ID
     * @param string $placeId
     * @return string
     */
    public function content(string $placeId): string {
        if (isset($this->translate[$placeId])) {
            return $this->translate[$placeId]->content;
        }

        return '';
    }

    /**
     * Подготоваливает массив $this->translate, содержащий переводы для каждого места.
     * Также, если $this->placeIds пустой, то заполняем его найденными ID мест, для
     * которых найдены соответствия критериям поиска.
     * @param array $data
     * @return array|void
     */
    protected function _prepareOutput(array $data) {
        if (empty($data)) {
            return $this->translate;
        }

        foreach ($data as $item) {
            if (
                isset($this->translate[$item->place]) &&
                strtotime($this->translate[$item->place]->created_at) > strtotime($item->created_at)
            ) {
                continue;
            }

            if (empty($this->placeIds)) {
                $this->placeIds[] = $item->place;
            }

            $this->translate[$item->place] = $item;
        }
    }
}