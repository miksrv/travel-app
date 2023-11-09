<?php namespace App\Libraries;

use App\Entities\User;
use App\Entities\UserLevel;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\TranslationsPlacesModel;
use App\Models\UsersLevelsModel;
use App\Models\UsersModel;
use ReflectionException;

class UserLevels {

    public User $user;
    public UserLevel $data;

    public int $experience;
    public int $level;

    /**
     * @param User $user
     */
    public function __construct(User $user) {
        $this->user       = $user;
        $this->level      = $user->level;
        $this->experience = $user->experience;

        return $this;
    }

    /**
     * The method starts recalculating the user's experience and returns experience and level.
     * If there is a discrepancy between the current experience or level - updates the user in the database.
     * @return $this
     * @throws ReflectionException
     */
    public function calculate(): static {
        $userLevelsModel = new UsersLevelsModel();

        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();
        $ratingModel = new RatingModel();
        $translateModel = new TranslationsPlacesModel();

        $placesCount = $placesModel->selectCount('id')->where('author', $this->user->id)->first();
        $photosCount = $photosModel->selectCount('id')->where('author', $this->user->id)->first();
        $ratingCount = $ratingModel->selectCount('id')->where('author', $this->user->id)->first();
        $translCount = $translateModel->selectCount('id')->where('author', $this->user->id)->first();

        $allUserLevels = $userLevelsModel->orderBy('experience')->findAll();

        // CALCULATE USER EXPERIENCE
        $experience = 0;
        $experience += $placesCount->id * 15;
        $experience += $photosCount->id * 10;
        $experience += $ratingCount->id * 1;
        $experience += $translCount->id * 5;

        $this->experience = $experience;

        $this->getUserLevel();

        if ($this->experience !== $this->user->experience || $this->level !== $this->user->level) {
            $userModel = new UsersModel();

            $userModel->update($this->user->id, [
                'level'      => $this->level,
                'experience' => $this->experience
            ]);

            // if ($this->level !== $this->user->level) {
            // TODO ОТПРАВИТЬ ПОЛЬЗОВАТЕЛЮ НОТИФИКАЦИЮ О ПОВЫШЕНИИ УРОВНЯ
            // }
        }

        return $this;
    }

    /**
     * @return void
     */
    public function getUserLevel(): void {
        $userLevelsModel = new UsersLevelsModel();
        $allUserLevels = $userLevelsModel->orderBy('experience')->findAll();

        // CALCULATE USER LEVEL
        $findLevel = null;

        foreach ($allUserLevels as $key => $level) {
            $nextKey = $key + 1;

            if (
                $nextKey !== count($allUserLevels) &&
                $this->experience >= $level->experience &&
                $this->experience < $allUserLevels[$nextKey]->experience
            ) {
                $level->nextLevel = $allUserLevels[$nextKey]->experience;
                $findLevel        = $level;
                break;
            }

            if ($nextKey === count($allUserLevels)) {
                $level->nextLevel = null;
                $findLevel        = $level;
                break;
            }
        }

        $this->data  = $findLevel;
        $this->level = $findLevel->level ?? 0;

        unset($this->data->id);
    }
}
