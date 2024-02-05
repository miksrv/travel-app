<?php namespace App\Libraries;

use App\Entities\User;
use App\Entities\UserLevel;
use App\Models\UsersActivityModel;
use App\Models\UsersLevelsModel;
use App\Models\UsersModel;
use Config\Services;
use ReflectionException;

define('MODIFIER_PLACE', 15);
define('MODIFIER_PHOTO', 10);
define('MODIFIER_RATING', 1);
define('MODIFIER_COVER', 2);
define('MODIFIER_EDIT', 5);

class UserLevels {
    private array $userLevels;

    public object $statistic;

    private array $types = ['place', 'photo', 'rating', 'edit', 'cover'];


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
        $activityModel = new UsersActivityModel();
        $activityData  = $activityModel
            ->selectCount('photo_id', 'photos')
            ->selectCount('rating_id', 'rating')
            ->where('user_id', $user->id)
            ->first();

        $placesCount = $activityModel
            ->selectCount('place_id', 'places')
            ->where(['user_id' => $user->id, 'type' => 'place'])
            ->first();

        $editsCount = $activityModel
            ->selectCount('place_id', 'places')
            ->where(['user_id' => $user->id, 'type' => 'edit'])
            ->first();

        $statistic = (object) [
            'places' => (int) $placesCount->places ?? 0,
            'photos' => (int) $activityData->photos ?? 0,
            'rating' => (int) $activityData->rating ?? 0,
            'edit'   => (int) $editsCount->places ?? 0,
        ];

        // CALCULATE USER EXPERIENCE
        $experience = 0;
        $experience += $statistic->places * MODIFIER_PLACE;
        $experience += $statistic->photos * MODIFIER_PHOTO;
        $experience += $statistic->rating * MODIFIER_RATING;
        $experience += $statistic->edit * MODIFIER_EDIT;

        $this->statistic = $statistic;

        // Let's see what level the user should actually have
        $calcLevel = $this->_findUserLevel($experience);

        // If we consider that the user’s actual experience or level does not correspond to that obtained
        // as a result of the calculation, then we will update the user data in the database
        if ($experience !== $user->experience || $calcLevel->level !== $user->level) {
            $userModel  = new UsersModel();
            $userNotify = new UserNotify();

            $userModel->update($user->id, [
                'level'      => $calcLevel->level,
                'experience' => $experience
            ]);

             if ($calcLevel->level !== $user->level) {
                 $userNotify->level($user->id);
             }
        }

        return $this;
    }

    /**
     * Add points for user experience
     * @param string $type
     * @param string $userId
     * @param string $objectId
     * @return bool
     * @throws ReflectionException
     */
    public function experience(string $type, string $userId, string $objectId): bool {
        $userModel  = new UsersModel();
        $userNotify = new UserNotify();
        $userData   = $userModel->select('id, experience, level')->find($userId);

        if (!in_array($type, $this->types) || !$userId || !$userData) {
            return false;
        }

        switch ($type) {
            case 'place' :
                $userData->experience += MODIFIER_PLACE;
                break;

            case 'photo' :
                $userData->experience += MODIFIER_PHOTO;
                break;

            case 'rating' :
                $userData->experience += MODIFIER_RATING;
                break;

            case 'edit' :
                $userData->experience += MODIFIER_EDIT;
                break;

            case 'cover' :
                $userData->experience += MODIFIER_COVER;
                break;
        }

        $calcLevel = $this->_findUserLevel($userData->experience);

        if ($calcLevel->level !== $userData->level) {
            $userNotify->level($userId);
            $userModel->update($userData->id, [
                'level'      => $calcLevel->level,
                'experience' => $userData->experience
            ]);

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
    public function getLevelData(User $user): ?object {
        $request    = Services::request();
        $levelIndex = array_search($user->level, array_column($this->userLevels, 'level'));

        if ($levelIndex === false) {
            return null;
        }

        if (isset($this->userLevels[$levelIndex + 1])) {
            $this->userLevels[$levelIndex]->nextLevel = $this->userLevels[$levelIndex + 1]->experience;
        }

        $this->userLevels[$levelIndex]->experience = $user->experience;

        $locale = $request->getLocale();
        $result = clone $this->userLevels[$levelIndex];
        $result->title = $result->{"title_$locale"};

        unset($result->title_en, $result->title_ru);

        return $result;
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
