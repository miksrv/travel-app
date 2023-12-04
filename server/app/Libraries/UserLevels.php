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

define('MODIFIER_PLACE', 15);
define('MODIFIER_PHOTO', 10);
define('MODIFIER_RATING', 1);
define('MODIFIER_EDIT', 5);

class UserLevels {
    private array $userLevels;

    private array $types = ['place', 'photo', 'rating', 'edit'];

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
        $statistic->places = (int) $placesModel->selectCount('id')->where('user_id', $this->user->id)->first()->id ?? 0;
        $statistic->photos = (int) $photosModel->selectCount('id')->where('user_id', $this->user->id)->first()->id ?? 0;
        $statistic->rating = (int) $ratingModel->selectCount('id')->where('user_id', $this->user->id)->first()->id ?? 0;
        $statistic->edits  = (int) $translModel->selectCount('id')->where('user_id', $this->user->id)->first()->id ?? 0;

        $statistic->edits  = $statistic->edits > $statistic->places
            ? ($statistic->edits - $statistic->places)
            : $statistic->edits;

        // CALCULATE USER EXPERIENCE
        $experience = 0;
        $experience += $statistic->places * MODIFIER_PLACE;
        $experience += $statistic->photos * MODIFIER_PHOTO;
        $experience += $statistic->rating * MODIFIER_RATING;
        $experience += $statistic->edits * MODIFIER_EDIT;

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

    public function experience(string $type, string $userId, string $objectId): bool {
        $userModel  = new UsersModel();
        $userNotify = new UserNotify();
        $userData   = $userModel->select('id, experience, level')->find($userId);

        if (!in_array($type, $this->types) || !$userId || !$userData) {
            return false;
        }

        if ($type === 'place') {
            $userData->experience += MODIFIER_PLACE;
        } else if ($type === 'photo') {
            $userData->experience += MODIFIER_PHOTO;
        } else if ($type === 'rating') {
            $userData->experience += MODIFIER_RATING;
        } else if ($type === 'edit') {
            $userData->experience += MODIFIER_EDIT;
        }

        $calcLevel = $this->_findUserLevel($userData->experience);

        if ($calcLevel->level !== $userData->level) {
            $userNotify->level($userId);
            $userModel->update($userData->id, [
                'level'      => $calcLevel->level,
                'experience' => $userData->experience
            ]);

            // if ($calcLevel->level !== $user->level) {
            // TODO ОТПРАВИТЬ ПОЛЬЗОВАТЕЛЮ НОТИФИКАЦИЮ О ПОВЫШЕНИИ УРОВНЯ
            // }

            return true;
        }

        $userNotify->experience($userId, $objectId);
        $userModel->update($userData->id, ['experience' => $userData->experience]);

        return true;
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
