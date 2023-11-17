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
    private array $userLevels;

    public function __construct() {
        $userLevelsModel  = new UsersLevelsModel();
        $this->userLevels = $userLevelsModel->orderBy('experience')->findAll();
    }

    /**
     * The method starts recalculating the user's experience and returns experience and level.
     * If there is a discrepancy between the current experience or level - updates the user in the database.
     *
     * The method is used when changing the gradation of levels (when you need to recalculate the levels of all users)
     * Or when the user adds/edits material
     * @return $this
     * @throws ReflectionException
     */
    public function calculate(User $user): static {
        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();
        $ratingModel = new RatingModel();
        $translModel = new TranslationsPlacesModel();

        $statistic = (object) [
            'places' => 0,
            'photos' => 0,
            'rating' => 0,
            'edits'  => 0,
        ];

        // #TODO вместо выполнения кучи запросов, будем делать всего один запрос на получение данных по активности пользователя
        $statistic->places = (int) $placesModel->selectCount('id')->where('author', $this->user->id)->first()->id ?? 0;
        $statistic->photos = (int) $photosModel->selectCount('id')->where('author', $this->user->id)->first()->id ?? 0;
        $statistic->rating = (int) $ratingModel->selectCount('id')->where('author', $this->user->id)->first()->id ?? 0;
        $statistic->edits  = (int) $translModel->selectCount('id')->where('author', $this->user->id)->first()->id ?? 0;

        $statistic->edits = $statistic->edits > $statistic->places
            ? ($statistic->edits - $statistic->places)
            : $statistic->edits;

        // CALCULATE USER EXPERIENCE
        $experience = 0;
        $experience += $statistic->places * 15;
        $experience += $statistic->photos * 10;
        $experience += $statistic->rating * 1;
        $experience += $statistic->edits * 5;

        // Let's see what level the user should actually have
        $calcLevel = $this->_findUserLevel($experience);

        // If we consider that the user’s actual experience or level does not correspond to that obtained
        // as a result of the calculation, then we will update the user data in the database
        if ($experience !== $user->experience || $calcLevel->level !== $user->level) {
            $userModel = new UsersModel();

            $userModel->update($user->id, [
                'level'      => $calcLevel->level,
                'experience' => $experience
            ]);

            // if ($calcLevel->level !== $user->level) {
            // TODO ОТПРАВИТЬ ПОЛЬЗОВАТЕЛЮ НОТИФИКАЦИЮ О ПОВЫШЕНИИ УРОВНЯ
            // }
        }

        return $this;
    }
    
    /**
     * We simply find the current user level in the database and return it, no calculations required
     * @param User $user
     * @return UserLevel|null
     */
    public function getLevelData(User $user): ?UserLevel {
        $levelIndex = array_search($user->level, array_column($this->userLevels, 'level'));

        if ($levelIndex === false) {
            return null;
        }

        if (isset($this->userLevels[$levelIndex + 1])) {
            $this->userLevels[$levelIndex]->nextLevel = $this->userLevels[$levelIndex + 1]->experience;
        }

        $this->userLevels[$levelIndex]->experience = $user->experience;

        return $this->userLevels[$levelIndex];
    }

    /**
     * We find the current level by the amount of user experience
     * @param int $experience
     * @return UserLevel
     */
    protected function _findUserLevel(int $experience): UserLevel {
        // If the experience is zero, then we immediately return the very first level (they are sorted by experience)
        if ($experience === 0) {
            return $this->userLevels[0];
        }

        foreach ($this->userLevels as $key => $level) {
            $nextKey = $key + 1;

            if (
                $nextKey !== count($this->userLevels) &&
                $experience >= $level->experience &&
                $experience < $this->userLevels[$nextKey]->experience
            ) {
                return $level;
            }

            // Reached the last level
            if ($nextKey === count($this->userLevels)) {
                return $level;
            }
        }

        // In all other cases, return the first level
        return $this->userLevels[0];
    }

}
