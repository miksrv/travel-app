<?php namespace App\Libraries;

use App\Models\PlacesTagsModel;
use App\Models\TagsModel;
use Config\Services;
use ReflectionException;

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
     * @throws ReflectionException
     */
    public function saveTags(array $tags, string $placeId): array {
        $locale     = Services::request()->getLocale();
        $updatedIds = [];
        $returnTags = [];

        if (!$placeId) {
            return $returnTags;
        }

        $this->placeTagsModel->where('place_id', $placeId)->delete();

        // If we just remove all tags
        if (empty($tags)) {
            return $returnTags;
        }

        foreach ($tags as $tag) {
            $tagData = $this->tagsModel
                ->where('title_ru', $tag)
                ->orWhere('title_en', $tag)
                ->first();

            if (!$tagData) {
                $this->tagsModel->insert(['title_' . $locale => $tag]);
                $this->placeTagsModel->insert([
                    'tag_id'   => $this->tagsModel->getInsertID(),
                    'place_id' => $placeId
                ]);

                $returnTags[] = $tag;

            } else {
                // We check that there are no identical IDs. This can happen if the same tag is added in two languages,
                // that is, the array of $tags tags comes as ['озеро', 'lake'] and both refer to the same tag in the database
                if (in_array($tagData->id, $updatedIds)) {
                    continue;
                }

                $this->placeTagsModel->insert([
                    'tag_id'   => $tagData->id,
                    'place_id' => $placeId
                ]);

                $returnTags[] = $tag;
                $updatedIds[] = $tagData->id;
            }
        }

        return $returnTags;
    }
}
