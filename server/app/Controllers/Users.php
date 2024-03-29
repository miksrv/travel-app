<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Libraries\LevelsLibrary;
use App\Libraries\SessionLibrary;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\UsersModel;
use CodeIgniter\Files\File;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;
use Exception;
use ReflectionException;

class Users extends ResourceController {
    public function __construct() {
        new LocaleLibrary();
    }

    /**
     * @return ResponseInterface
     * @throws Exception
     */
    public function list(): ResponseInterface {
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 40;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $userLevels = new LevelsLibrary();
        $usersModel = new UsersModel();
        $usersData  = $usersModel
            ->select('id, name, avatar, created_at, activity_at, updated_at, level, experience, reputation')
            ->orderBy('activity_at, updated_at', 'DESC')
            ->findAll(abs($limit), abs($offset));

        $result = [];

        if (empty($usersData)) {
            return $this->respond([
                'items' => $result,
                'count' => 0
            ]);
        }

        foreach ($usersData as $item) {
            $level    = $userLevels->getLevelData($item);
            $avatar   = $item->avatar ? explode('.', $item->avatar) : null;
            $result[] = (object) [
                'id'     => $item->id,
                'name'   => $item->name,
                'avatar' => $avatar
                    ? PATH_AVATARS . $item->id . '/' . $avatar[0] . '_small.' . $avatar[1]
                    : null,
                'level'  => [
                    'level'      => $level->level,
                    'title'      => $level->title,
                    'experience' => $item->experience,
                    'nextLevel'  => $level->nextLevel,
                ],
                'reputation' => $item->reputation,
                'created'    => $item->created_at,
                'activity'   => $item->activity_at ? new \DateTime($item->activity_at) : null
            ];
        }

        return $this->respond([
            'items' => $result,
            'count' => $usersModel->select('id')->countAllResults()
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     * @throws Exception
     */
    public function show($id = null): ResponseInterface {
        $userLevels  = new LevelsLibrary();
        $usersModel  = new UsersModel();
        $placesModel = new PlacesModel();
        $usersData   = $usersModel->getUserById($id);

        if (!$usersData) {
            return $this->failNotFound();
        }

        // Calculate new user reputation value
        if ($placesData  = $placesModel->select('id')->where('user_id', $id)->findAll()) {
            $ratingModel = new RatingModel();
            $placesIds   = [];

            foreach ($placesData as $place) {
                $placesIds[] = $place->id;
            }

            $ratingData  = $ratingModel->select('value')->whereIn('place_id', $placesIds)->findAll();
            $ratingValue = 0;

            if ($ratingData) {
                helper('rating');

                foreach ($ratingData as $ratingItem) {
                    $ratingValue = $ratingValue + transformRating($ratingItem->value);
                }
            }

            if ($ratingValue !== $usersData->reputation) {
                $usersModel->update($usersData->id, ['reputation' => $ratingValue]);

                $usersData->reputation = $ratingValue;
            }
        }

        $userLevels->calculate($usersData);

        $avatar = $usersData->avatar ? explode('.', $usersData->avatar) : null;

        $usersData->level     = $userLevels->getLevelData($usersData);
        $usersData->statistic = $userLevels->statistic;
        $usersData->avatar    = $usersData->avatar
                ? PATH_AVATARS . $usersData->id . '/' . $avatar[0] . '_medium.' . $avatar[1]
                : null;

        unset($usersData->experience);

        return $this->respond($usersData);
    }

    /**
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function update($id = null): ResponseInterface {
        $session = new SessionLibrary();

        if (!$session->isAuth || $session->user?->id !== $id) {
            return $this->failUnauthorized();
        }

        $input = $this->request->getJSON();
        $rules = [
            'name'    => 'if_exist|min_length[6]|max_length[150]|is_unique[users.name]',
            'website' => 'if_exist|max_length[150]|string',
            'oldPassword' => 'if_exist|min_length[8]|max_length[50]',
            'newPassword' => 'if_exist|min_length[8]|max_length[50]',
        ];

        if (!$this->validateData((array) $input, $rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $userModel  = new UsersModel();
        $updateData = [];

        if (isset($input->oldPassword) && isset($input->newPassword)) {
            helper('auth');

            $validatePassword = $userModel
                ->select('password')
                ->where(['email' => $session->user?->email, 'auth_type' => AUTH_TYPE_NATIVE])
                ->first();

            if (!password_verify($input->oldPassword, $validatePassword->password)) {
                return $this->failValidationErrors('Введенный старый пароль не верный');
            }

            $updateData['password'] = hashUserPassword($input->newPassword);
        }

        if (isset($input->name)) {
            $updateData['name'] = $input->name;
        }

        if (isset($input->website)) {
            $updateData['website'] = $input->website;
        }

        if (empty($updateData)) {
            return $this->failValidationErrors('No data for update');
        }

        $userModel->update($id, $updateData);

        return $this->respondUpdated();
    }

    /**
     * @return ResponseInterface
     */
    public function avatar(): ResponseInterface {
        $session    = new SessionLibrary();

        if (!$session->isAuth || !$session->user?->id) {
            return $this->failUnauthorized();
        }

        if (!$photo = $this->request->getFile('avatar')) {
            return $this->failValidationErrors('No photo for upload');
        }

        if (!$photo->hasMoved()) {
            if (!is_dir(UPLOAD_TEMPORARY)) {
                mkdir(UPLOAD_TEMPORARY,0777, TRUE);
            }

            $filename = $session->user->id . '.' . $photo->getExtension();
            $photo->move(UPLOAD_TEMPORARY, $filename, true);

            list($width, $height) = getimagesize(UPLOAD_TEMPORARY . $filename);

            // Calculating Aspect Ratio
            $orientation = $width > $height ? 'h' : 'v';
            $width  = $orientation === 'h' ? $width : $height;
            $height = $orientation === 'h' ? $height : $width;

            // If the uploaded image dimensions exceed the maximum
            if ($width > AVATAR_MAX_WIDTH || $height > AVATAR_MAX_HEIGHT) {
                $image = Services::image('gd');
                $image->withFile(UPLOAD_TEMPORARY . $filename)
                    ->fit(AVATAR_MAX_WIDTH, AVATAR_MAX_HEIGHT)
                    ->reorient(true)
                    ->save(UPLOAD_TEMPORARY . $filename);

                list($width, $height) = getimagesize(UPLOAD_TEMPORARY . $filename);
            }

            return $this->respondCreated([
                'filename' => $filename,
                'filepath' => PATH_TEMPORARY . $filename,
                'width'    => $width,
                'height'   => $height
            ]);
        }

        return $this->failValidationErrors($photo->getErrorString());
    }

    /**
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function crop(): ResponseInterface {
        $session    = new SessionLibrary();
        $usersModel = new UsersModel();

        if (!$session->isAuth || !$session->user?->id) {
            return $this->failUnauthorized();
        }

        if (!$user = $usersModel->find($session->user?->id)) {
            return $this->failValidationErrors('User not found');
        }

        $input = $this->request->getJSON();

        if (!isset($input->x) ||
            !isset($input->y) ||
            !isset($input->width) ||
            !isset($input->height) ||
            !isset($input->filename) ||
            !file_exists(UPLOAD_TEMPORARY . $input->filename))
        {
            return $this->failValidationErrors('Incorrect data format when saving cover image');
        }

        if ($input->width < AVATAR_SMALL_WIDTH || $input->height < AVATAR_SMALL_HEIGHT) {
            return $this->failValidationErrors('The width and length measurements are not correct, they are less than the minimum values');
        }

        $userAvatarDir = UPLOAD_AVATARS . $user->id . '/';

        // Remove old avatar
        if ($user->avatar) {
            $avatar = explode('.', $user->avatar);

            @unlink($userAvatarDir . $user->avatar);
            @unlink($userAvatarDir . $avatar[0] . '_small.' . $avatar[1]);
            @unlink($userAvatarDir . $avatar[0] . '_medium.' . $avatar[1]);
        }

        if (!is_dir($userAvatarDir)) {
            mkdir($userAvatarDir,0777, TRUE);
        }

        $file = new File(UPLOAD_TEMPORARY . $input->filename);
        $rand = $file->getRandomName();
        $file->move(UPLOAD_AVATARS . $user->id, $rand, true);

        $name  = explode('.', $rand);
        $image = Services::image('gd'); // imagick
        $image->withFile($userAvatarDir . $rand)
            ->crop($input->width, $input->height, $input->x, $input->y)
            ->resize(AVATAR_SMALL_WIDTH, AVATAR_SMALL_HEIGHT)
            ->save($userAvatarDir . $name[0] . '_small.' . $name[1]);

        $image->withFile($userAvatarDir . $rand)
            ->crop($input->width, $input->height, $input->x, $input->y)
            ->resize(AVATAR_MEDIUM_WIDTH, AVATAR_MEDIUM_HEIGHT)
            ->save($userAvatarDir . $name[0] . '_medium.' . $name[1]);

        $usersModel->update($user->id, ['avatar' => $rand]);

        return $this->respondUpdated(['filepath' => PATH_AVATARS . $user->id . '/' . $name[0] . '_medium.' . $name[1]]);
    }
}