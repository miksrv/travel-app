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

    public function saveTags(array $tags, string $placeId): bool {
        $localeLibrary = new LocaleLibrary();

        if (!$placeId) {
            return false;
        }

        $this->placeTagsModel->where('place_id', $placeId)->delete();

        if (empty($tags)) {
            return true;
        }

        foreach ($tags as $tag) {
            $tagData = $this->tagsModel->where(['title_' . $localeLibrary->locale => $tag])->first();

            if (!$tagData) {
                $this->tagsModel->insert(['title_' . $localeLibrary->locale => $tag,]);

                $this->placeTagsModel->insert([
                    'tag_id'   => $this->tagsModel->getInsertID(),
                    'place_id' => $placeId
                ]);

            } else {

                $this->tagsModel->update($tagData->id);
                $this->placeTagsModel->insert([
                    'tag_id'   => $tagData->id,
                    'place_id' => $placeId
                ]);
            }
        }

        return true;
    }
}
