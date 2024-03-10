<?php namespace App\Controllers;

use App\Models\PlacesTagsModel;
use App\Models\TagsModel;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

set_time_limit(0);

class System extends ResourceController {
    /**
     * We recalculate and update the geotag tag usage counter
     * @return void
     * @throws ReflectionException
     */
    public function calculateTagsCount(): void {
        $tagsModel      = new TagsModel();
        $placeTagsModel = new PlacesTagsModel();
        $updatedRows    = 0;

        if ($tagsData = $tagsModel->select('id, count')->findAll()) {
            foreach ($tagsData as $tag) {
                $count = $placeTagsModel->where('tag_id', $tag->id)->countAllResults();

                if ($tag->count !== $count) {
                    $tagsModel->update($tag->id, ['count' => $count]);
                    $updatedRows++;
                }
            }
        }

        echo $updatedRows;
    }
}