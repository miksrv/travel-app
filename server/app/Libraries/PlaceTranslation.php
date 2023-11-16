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
            'id, place, title, author, created_at, updated_at,' .
            ($this->trim > 0 ? 'SUBSTRING(translations_places.content, 1, ' . $this->trim . ') as content' : 'translations_places.content')
        );
    }

    /**
     * @param string $term
     * @return void
     */
    public function search(string $term): void {
        $this->search = $term;

        $data = $this->model
            ->like('title', $term)
            ->orLike('content', $term)
            ->orderBy('created_at', 'DESC')
            ->findAll();

        $this->_prepareOutput($data);
    }

    /**
     * @param array $placeIds
     * @return void
     */
    public function translate(array $placeIds): void {
        $this->placeIds = $placeIds;

        if (empty($placeIds)) {
            return ;
        }

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
        return $this->_get($placeId, 'title');
    }

    /**
     * Return title for place by ID
     * @param string $placeId
     * @return string
     */
    public function content(string $placeId): string {
        return $this->_get($placeId, 'content');
    }

    /**
     * Return author ID for translation place by ID
     * @param string $placeId
     * @return string
     */
    public function author(string $placeId): string {
        return $this->_get($placeId, 'author');
    }

    /**
     * Return updated time for translation place by ID
     * @param string $placeId
     * @return string
     */
    public function updated(string $placeId): string {
        return $this->_get($placeId, 'updated_at');
    }

    /**
     * Return updated time for translation place by ID
     * @param string $placeId
     * @return string
     */
    public function id(string $placeId): string {
        return $this->_get($placeId, 'id');
    }

    /**
     * @param string $id
     * @param string $field
     * @return string
     */
    protected function _get(string $id, string $field): string {
        if (isset($this->translate[$id])) {
            return $this->translate[$id]->{$field};
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

            $this->placeIds[] = $item->place;
            $this->translate[$item->place] = $item;
        }
    }
}