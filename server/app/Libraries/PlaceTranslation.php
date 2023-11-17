<?php namespace App\Libraries;

use App\Models\TranslationsPlacesModel;

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
    protected array $versions = [];
    public array $placeIds = [];
    protected string $language = 'ru';
    protected int $trim;
    protected string $search;

    protected bool $keepVersions = false;

    private TranslationsPlacesModel $model;

    /**
     * When calling the constructor, we set the parameters and start working with the model.
     * The library works in two modes:
     *  1) Search by keyword and return a list of location and content IDs for each
     *  2) Gets a list of place IDs, extracts content for them and returns it
     * @param string $language
     * @param int $trim
     */
    public function __construct(string $language = 'ru', int $trim = 0) {
        $this->model    = new TranslationsPlacesModel();
        $this->language = $language;
        $this->trim     = $trim;

        $this->model->select(
            'id, place, title, author, delta, created_at, updated_at,' .
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
     * When we request translations for all places, we can immediately indicate whether we should store content
     * versions for each translation or not (these versions are needed so that when requesting an activity,
     * we can compare the translation of the place on the date the activity was added)
     * @param array $placeIds
     * @param bool $keepVersions
     * @return void
     */
    public function translate(array $placeIds, bool $keepVersions = false): void {
        $this->placeIds = $placeIds;

        if (empty($placeIds)) {
            return ;
        }

        // Setting a global variable
        if ($keepVersions === true) {
            $this->keepVersions = true;
        }

        // Here we get all edition versions for all places by their ID
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
        return $this->get($placeId, 'title');
    }

    /**
     * Return title for place by ID
     * @param string $placeId
     * @return string
     */
    public function content(string $placeId): string {
        return $this->get($placeId, 'content');
    }

    /**
     * Return author ID for translation place by ID
     * @param string $placeId
     * @return string
     */
    public function author(string $placeId): string {
        return $this->get($placeId, 'author');
    }

    /**
     * Return updated time for translation place by ID
     * @param string $placeId
     * @return string
     */
    public function updated(string $placeId): string {
        return $this->get($placeId, 'updated_at');
    }

    /**
     * Return updated time for translation place by ID
     * @param string $placeId
     * @return string
     */
    public function id(string $placeId): string {
        return $this->get($placeId, 'id');
    }

    /**
     * @param string $id
     * @param string $field
     * @param string|null $version
     * @return string
     */
    public function get(string $id, string $field, string $version = null): string {
        if ($version && isset($this->versions[$id])) {
            $findKey = array_search($version, array_column($this->versions[$id], 'created_at'));

            if ($findKey !== false) {
                return $this->versions[$id][$findKey]->{$field};
            }
        }

        if (isset($this->translate[$id])) {
            return $this->translate[$id]->{$field};
        }

        return '';
    }

    /**
     * Prepares an array $this->translate containing translations for each location.
     * Also, if $this->placeIds is empty, then fill it with the found IDs of places for
     * which matches to the search criteria were found.
     * @param array $data translations data for all places (by array of IDs)
     * @return array|void
     */
    protected function _prepareOutput(array $data) {
        if (empty($data)) {
            return $this->translate;
        }

        foreach ($data as $item) {
            // While searching through each translation - if a translation has already been found for the location
            // (and it was added to the general array of ready-made translations)
            // and if the date of the added translation is greater than the date of the current searched region -
            // we add such a translation to the history and move on.
            if (
                isset($this->translate[$item->place]) &&
                strtotime($this->translate[$item->place]->created_at) > strtotime($item->created_at)
            ) {
                if ($this->keepVersions) {
                    $this->versions[$item->place][] = $item;
                }

                continue;
            }

            $this->placeIds[] = $item->place;
            $this->translate[$item->place] = $item;
        }
    }
}