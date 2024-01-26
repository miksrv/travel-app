<?php namespace App\Libraries;

use App\Models\PlacesTagsModel;
use App\Models\TagsModel;

class PlaceTags {

    private TagsModel $tagsModel;
    private PlacesTagsModel $placeTagsModel;

    public function __construct() {
        $this->tagsModel      = new TagsModel();
        $this->placeTagsModel = new PlacesTagsModel();
    }

    /**
     * @param array $tags
     * @param string $placeId
     * @return array
     * @throws \ReflectionException
     */
    public function saveTags(array $tags, string $placeId): array {
        $localeLibrary = new LocaleLibrary();
        $returnTags    = [];

        if (!$placeId || empty($tags)) {
            return $returnTags;
        }

        $this->placeTagsModel->where('place_id', $placeId)->delete();

        foreach ($tags as $tag) {
            $tagData = $this->tagsModel->where(['title_' . $localeLibrary->locale => $tag])->first();

            if (!$tagData) {
                $this->tagsModel->insert(['title_' . $localeLibrary->locale => $tag,]);
                $this->placeTagsModel->insert([
                    'tag_id'   => $this->tagsModel->getInsertID(),
                    'place_id' => $placeId
                ]);

                $returnTags[] = [
                    'id'    => $this->tagsModel->getInsertID(),
                    'title' => $tag,
                ];

            } else {
                $this->placeTagsModel->insert([
                    'tag_id'   => $tagData->id,
                    'place_id' => $placeId
                ]);

                $returnTags[] = [
                    'id'    => $tagData->id,
                    'title' => $tag,
                ];
            }
        }

        return $returnTags;
    }
}
