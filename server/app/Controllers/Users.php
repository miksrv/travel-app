<?php namespace App\Controllers;

use App\Libraries\ActivityLibrary;
use App\Libraries\LocaleLibrary;
use App\Libraries\LevelsLibrary;
use App\Libraries\SessionLibrary;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\UsersModel;
use CodeIgniter\Files\File;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\I18n\Time;
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
                    ? PATH_AVATARS . $item->id . '/' . $avatar[0] . '_preview.' . $avatar[1]
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
        $userLevels = new LevelsLibrary();
        $usersModel = new UsersModel();
        $usersData  = $usersModel
            ->select('id, name, avatar, created_at, updated_at, activity_at, level, website, experience, reputation')
            ->find($id);

        if (!$usersData) {
            return $this->failNotFound();
        }

        // GET ALL USER REPUTATION
        $placesModel = new PlacesModel();
        $placesData  = $placesModel->select('id')->where('user_id', $id)->findAll();
        $ratingValue = $usersData->reputation;

        $userLevels->calculate($usersData);

        // Calculate new user reputation value
        if ($placesData) {
            $ratingModel = new RatingModel();
            $placesIds   = [];

            foreach ($placesData as $place) {
                $placesIds[] = $place->id;
            }

            $ratingDataPlus  = $ratingModel->selectCount('value')->where('value >', 2)->whereIn('place_id', $placesIds)->first();
            $ratingDataMinus = $ratingModel->selectCount('value')->where('value <=', 2)->whereIn('place_id', $placesIds)->first();
            $ratingValue     = $ratingDataPlus->value - $ratingDataMinus->value;

            if ($ratingValue !== $usersData->reputation) {
                $usersModel->update($usersData->id, ['reputation' => $ratingValue]);
            }
        }

        $result = (object) [
            'id'         => $usersData->id,
            'name'       => $usersData->name,
            'level'      => $userLevels->getLevelData($usersData),
            'statistic'  => $userLevels->statistic,
            'reputation' => $ratingValue,
            'website'    => $usersData->website,
            'created'    => $usersData->created_at,
            'updated'    => $usersData->updated_at,
            'activity'   => $usersData->activity_at ? new \DateTime($usersData->activity_at) : null,
            'avatar'     => $usersData->avatar
                ? PATH_AVATARS . $usersData->id . '/' . $usersData->avatar
                : null
        ];

        return $this->respond($result);
    }

    /**
     * @throws ReflectionException
     */
    public function update($id = null) {
        $session = new SessionLibrary();

        if (!$session->isAuth || $session->user?->id !== $id) {
            return $this->failUnauthorized();
        }

        $input = $this->request->getJSON();
        $rules = [
            'name'    => 'if_exist|is_unique[users.name]',
            'website' => 'if_exist|min_length[6]|max_length[150]|string'
        ];

        if (!$this->validateData((array) $input, $rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $updateData = [];

        if (isset($input->name)) {
            $updateData['name'] = $input->name;
        }

        if (isset($input->website)) {
            $updateData['website'] = $input->website;
        }

        if (empty($updateData)) {
            return $this->failValidationErrors('No data for update');
        }


        $userModel = new UsersModel();
        $userModel->update($id, $updateData);

        return $this->respondUpdated();
    }

    /**
     * @throws ReflectionException
     */
    public function avatar(): ResponseInterface {
        $session    = new SessionLibrary();
        $usersModel = new UsersModel();

        if (!$session->isAuth || !$session->user?->id) {
            return $this->failUnauthorized();
        }

        if (!$photo = $this->request->getFile('avatar')) {
            return $this->failValidationErrors('No photo for upload');
        }

        if (!$user = $usersModel->find($session->user?->id)) {
            return $this->failValidationErrors('User not found');
        }

        if (!$photo->hasMoved()) {
            $avatarDir = UPLOAD_AVATARS . $session->user->id . '/';
            $newName   = $photo->getRandomName();
            $photo->move($avatarDir, $newName, true);

            $file = new File($avatarDir . $newName);
            $name = pathinfo($file, PATHINFO_FILENAME);
            $ext = $file->getExtension();

            list($width, $height) = getimagesize($file->getRealPath());

            // Calculating Aspect Ratio
            $orientation = $width > $height ? 'h' : 'v';
            $width = $orientation === 'h' ? $width : $height;
            $height = $orientation === 'h' ? $height : $width;

            // If the uploaded image dimensions exceed the maximum
            if ($width > PHOTO_MAX_WIDTH || $height > PHOTO_MAX_HEIGHT) {
                $image = Services::image('gd');
                $image->withFile($file->getRealPath())
                    ->fit(PHOTO_MAX_WIDTH, PHOTO_MAX_HEIGHT)
                    ->reorient()
                    ->save($avatarDir . $name . '.' . $ext);
            }

            $image = Services::image('gd'); // imagick
            $image->withFile($file->getRealPath())
                ->fit(40, 40, 'center')
                ->save($avatarDir . $name . '_preview.' . $ext);

            // Remove old avatar
            if ($user->avatar) {
                $avatar = explode('.', $user->avatar);

                unlink(UPLOAD_AVATARS . $user->id . '/' . $user->avatar);
                unlink(UPLOAD_AVATARS . $user->id . '/' . $avatar[0] . '_preview.' . $avatar[1]);
            }

            $usersModel->update($user->id, ['avatar' => $name . '.' . $ext]);

            return $this->respondUpdated();
        }

        return $this->failValidationErrors($photo->getErrorString());
    }

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

        if (!isset($input->x) || !isset($input->y) || !$input->width || !$input->height) {
            return $this->failValidationErrors('Incorrect data format when saving cover image');
        }

        if ($input->width < 100 || $input->height < 100) {
            return $this->failValidationErrors('The width and length measurements are not correct, they are less than the minimum values');
        }

        $avatarDir = UPLOAD_AVATARS . $user->id . '/';
        $file = new File($avatarDir . $user->avatar);
        $filename = explode('.', $user->avatar);

        list($width, $height) = getimagesize($file->getRealPath());

        $image = Services::image('gd'); // imagick
        $image->withFile($file->getRealPath())
            ->crop($input->width, $input->height, $input->x, $input->y)
            ->resize(100, 100)
            ->save($avatarDir . $filename[0] . '_preview.' . $filename[1]);

        return $this->respondUpdated();
    }
}