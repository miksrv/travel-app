<?php namespace App\Controllers;

use App\Libraries\LevelsLibrary;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
use App\Models\TagsModel;
use App\Models\UsersModel;
use CodeIgniter\I18n\Time;
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

    /**
     * We update the activity time of some users to simulate that they are active on the site
     * @return void
     * @throws ReflectionException
     */
    public function generateUsersOnline(): void {
        $usersModel = new UsersModel();
        $usersData  = $usersModel->select('id, updated_at')->like('email', '%@geometki.com')->findAll();

        if (!$usersData) {
            return ;
        }

        $numItems   = ceil(count($usersData) * 0.3);
        $randomKeys = array_rand($usersData, $numItems);

        foreach ($randomKeys as $key) {
            $randomSeconds = rand(0, 5 * 60);
            $currentTime   = new Time("now -{$randomSeconds} seconds");

            $usersModel->update($usersData[$key]->id, [
                'updated_at'  => $usersData[$key]->updated_at,
                'activity_at' => $currentTime,
            ]);
        }
    }

    /**
     * Temporary function, must be DELETED after first use
     * @return void
     * @throws ReflectionException
     */
    public function removeDeletedPhotos(): void {
        $photosModel   = new PhotosModel();
        $deletedPhotos = $photosModel->where('deleted_at !=', 'null')->withDeleted()->findAll();

        foreach ($deletedPhotos as $photo) {
            if (!$photosModel->delete($photo->id, true)) {
                echo '<pre>';
                var_dump('Delete Error');
                exit();
            }

            if (file_exists(UPLOAD_PHOTOS . $photo->place_id . '/' . $photo->filename . '.' . $photo->extension)) {
                unlink(UPLOAD_PHOTOS . $photo->place_id . '/' . $photo->filename . '.' . $photo->extension);
                unlink(UPLOAD_PHOTOS . $photo->place_id . '/' . $photo->filename . '_preview.' . $photo->extension);
            }

            $userModel  = new UsersModel();
            $userLevels = new LevelsLibrary();
            $userLevels->calculate($userModel->getUserById($photo->user_id));

            $placesModel = new PlacesModel();
            $countPhotos = $photosModel->select('id')->where('place_id', $photo->place_id)->countAllResults();
            $placesModel->update($photo->place_id, ['photos' => $countPhotos]);
        }
    }
}