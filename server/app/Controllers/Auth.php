<?php namespace App\Controllers;

use App\Entities\User;
use App\Libraries\GoogleClient;
use App\Libraries\LocaleLibrary;
use App\Libraries\SessionLibrary;
use App\Libraries\YandexClient;
use App\Models\UsersModel;
use CodeIgniter\Files\File;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Validation\Exceptions\ValidationException;
use Config\Services;
use Exception;
use ReflectionException;

define('AUTH_TYPE_NATIVE', 'native');
define('AUTH_TYPE_GOOGLE', 'google');
define('AUTH_TYPE_YANDEX', 'yandex');

class Auth extends ResourceController {
    private SessionLibrary $session;

    public function __construct() {
        new LocaleLibrary();

        $this->session = new SessionLibrary();
    }

    /**
     * Register a new user
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function registration(): ResponseInterface {
        if ($this->session->isAuth) {
            return $this->failForbidden('Already authorized');
        }

        $validationRules = [
            'name'     => 'required|is_unique[users.name]',
            'email'    => 'required|min_length[6]|max_length[50]|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[8]|max_length[255]'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $validationRules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        helper('auth');

        $userModel = new UsersModel();
        $user      = new User();
        $user->name      = $input['name'];
        $user->email     = $input['email'];
        $user->password  = hashUserPassword($input['password']);
        $user->auth_type = AUTH_TYPE_NATIVE;
        $user->level     = 1;

        $userModel->save($user);

        $user->id = $userModel->getInsertID();

        unset($user->password);

        $this->session->authorization($user);

        return $this->responseAuth();
    }

    /**
     * Google auth
     * @link https://console.developers.google.com/
     * @throws ReflectionException
     */
    public function google(): ResponseInterface {
        if ($this->session->isAuth) {
            return $this->failForbidden('Already authorized');
        }

        $googleClient = new GoogleClient();
        $googleClient->setClientId(getenv('auth.google.clientID'));
        $googleClient->setClientSecret(getenv('auth.google.secret'));
        $googleClient->setRedirectUri(getenv('auth.google.redirect'));

        $authCode = $this->request->getGet('code', FILTER_SANITIZE_SPECIAL_CHARS);

        // If there is no authorization code, then the user has not yet logged in to Yandex.
        if (!$authCode) {
            return $this->respond([
                'auth'     => false,
                'redirect' => $googleClient->createAuthUrl(),
            ]);
        }

        $googleClient->fetchAccessTokenWithAuthCode($authCode);
        $googleUser = $googleClient->fetchUserInfo();

        if (!$googleUser || !$googleUser->email) {
            return $this->failValidationErrors('Google login error');
        }

        // Successful authorization, look for a user with the same email in the database
        $userModel = new UsersModel();
        $userData  = $userModel->findUserByEmailAddress($googleUser->email);

        // If there is no user with this email, then register a new user
        if (!$userData) {
            $user = new User();
            $user->name      = $googleUser->name;
            $user->email     = $googleUser->email;
            $user->auth_type = AUTH_TYPE_GOOGLE;
            $user->locale    = $googleUser->locale === 'ru' ? 'ru' : 'en';
            $user->level     = 1;

            $userModel->insert($user);

            $newUserId = $userModel->getInsertID();

            // If a Google user has an avatar, copy it
            if ($googleUser->picture) {
                $avatarDirectory = UPLOAD_AVATARS . '/' . $newUserId . '/';
                $avatar = md5($googleUser->name . AUTH_TYPE_GOOGLE . $googleUser->email) . '.jpg';

                if (!is_dir($avatarDirectory)) {
                    mkdir($avatarDirectory,0777, TRUE);
                }

                file_put_contents($avatarDirectory . $avatar, file_get_contents($googleUser->picture));

                $file = new File($avatarDirectory . $avatar);
                $name = pathinfo($file, PATHINFO_FILENAME);
                $ext  = $file->getExtension();

                $image = Services::image('gd'); // imagick
                $image->withFile($file->getRealPath())
                    ->fit(AVATAR_SMALL_WIDTH, AVATAR_SMALL_HEIGHT)
                    ->save($avatarDirectory  . $name . '_small.' . $ext);

                $image->withFile($file->getRealPath())
                    ->fit(AVATAR_MEDIUM_WIDTH, AVATAR_MEDIUM_HEIGHT)
                    ->save($avatarDirectory  . $name . '_medium.' . $ext);

                $userModel->update($newUserId, ['avatar' => $avatar]);
            }

            $userData = $user;
            $userData->id = $newUserId;
        }

        // All migrated users will not have an authorization type in the database, so it will be possible to
        // either recover the password or log in through Google or another system.
        // But if the authorization type is already specified, you should authorize only this way.
        if ($userData->auth_type !== null && $userData->auth_type !== AUTH_TYPE_GOOGLE) {
            log_message('error', 'The user cannot log in because he has a different type of account authorization');
            return $this->failValidationErrors('You have a different authorization type set to Google');
        }

        if ($userData->auth_type !== AUTH_TYPE_GOOGLE) {
            $userModel->update($userData->id, ['auth_type' => AUTH_TYPE_GOOGLE]);
        }

        $this->session->authorization($userData);

        return $this->responseAuth();
    }

    /**
     * @link https://oauth.yandex.ru/
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function yandex(): ResponseInterface {
        if ($this->session->isAuth) {
            return $this->failForbidden('Already authorized');
        }

        $yandexClient = new YandexClient();

        $yandexClient->setClientId(getenv('auth.yandex.clientID'));
        $yandexClient->setClientSecret(getenv('auth.yandex.secret'));
        $yandexClient->setRedirectUri(getenv('auth.yandex.redirect'));

        $authCode = $this->request->getGet('code', FILTER_SANITIZE_SPECIAL_CHARS);

        // If there is no authorization code, then the user has not yet logged in to Yandex.
        if (!$authCode) {
            return $this->respond([
                'auth'     => false,
                'redirect' => $yandexClient->createAuthUrl(),
            ]);
        }

        $yandexClient->fetchAccessTokenWithAuthCode($authCode);
        $yandexUser  = $yandexClient->fetchUserInfo();
        $yandexEmail = strtolower($yandexUser->default_email);

        if (!$yandexUser || !$yandexEmail) {
            return $this->failValidationErrors('Yandex login error');
        }

        // Successful authorization, look for a user with the same email in the database
        $userModel = new UsersModel();
        $userData  = $userModel->findUserByEmailAddress($yandexEmail);

        // If there is no user with this email, then register a new user
        if (!$userData) {
            $user = new User();
            $user->name      = $yandexUser->real_name;
            $user->email     = $yandexEmail;
            $user->auth_type = AUTH_TYPE_YANDEX;
            $user->locale    = $this->request->getLocale();
            $user->level     = 1;

            $userModel->insert($user);

            $newUserId = $userModel->getInsertID();

            // If a Google user has an avatar, copy it
            if (!$yandexUser->is_avatar_empty && $yandexUser->default_avatar_id) {
                $avatarDirectory = UPLOAD_AVATARS . '/' . $newUserId . '/';
                $yandexAvatarUrl = "https://avatars.yandex.net/get-yapic/{$yandexUser->default_avatar_id}/islands-200";
                $avatar = md5($yandexUser->real_name . AUTH_TYPE_YANDEX . $yandexEmail) . '.jpg';

                if (!is_dir($avatarDirectory)) {
                    mkdir($avatarDirectory,0777, TRUE);
                }

                file_put_contents($avatarDirectory . $avatar, file_get_contents($yandexAvatarUrl));

                $file = new File($avatarDirectory . $avatar);
                $name = pathinfo($file, PATHINFO_FILENAME);
                $ext  = $file->getExtension();

                $image = Services::image('gd'); // imagick
                $image->withFile($file->getRealPath())
                    ->fit(AVATAR_SMALL_WIDTH, AVATAR_SMALL_HEIGHT)
                    ->save($avatarDirectory  . $name . '_small.' . $ext);

                $image->withFile($file->getRealPath())
                    ->fit(AVATAR_MEDIUM_WIDTH, AVATAR_MEDIUM_HEIGHT)
                    ->save($avatarDirectory  . $name . '_medium.' . $ext);

                $userModel->update($newUserId, ['avatar' => $avatar]);
            }

            $userData = $user;
            $userData->id = $newUserId;
        }

        // All migrated users will not have an authorization type in the database, so it will be possible to
        // either recover the password or log in through Google or another system.
        // But if the authorization type is already specified, you should authorize only this way.
        if ($userData->auth_type !== null && $userData->auth_type !== AUTH_TYPE_YANDEX) {
            log_message('error', 'The user cannot log in because he has a different type of account authorization');
            return $this->failValidationErrors('You have a different authorization type set to Yandex');
        }

        if ($userData->auth_type !== AUTH_TYPE_YANDEX) {
            $userModel->update($userData->id, ['auth_type' => AUTH_TYPE_YANDEX]);
        }

        $this->session->authorization($userData);

        return $this->responseAuth();
    }

    /**
     * Authenticate Existing User
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function login(): ResponseInterface {
        if ($this->session->isAuth) {
            return $this->failForbidden('Already authorized');
        }

        $rules = [
            'email'    => 'required|min_length[6]|max_length[50]|valid_email',
            'password' => 'required|min_length[8]|max_length[255]|validateUser[email, password]'
        ];

        $errors = [
            'password' => [
                'validateUser' => 'Invalid login credentials provided'
            ]
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules, $errors)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $userModel = new UsersModel();
        $userData  = $userModel->findUserByEmailAddress($input['email']);

        $this->session->authorization($userData);

        return $this->responseAuth();
    }

    /**
     * @throws Exception
     */
    public function me(): ResponseInterface {
        $this->session->update();

        $response = (object) [
            'session' => $this->session->id,
            'auth'    => $this->session->isAuth
        ];

        if ($this->session->isAuth && $this->session->user) {
            $response->user  = $this->session->user;
            $response->token = generateAuthToken($this->session->user->email);
        }

        return $this->respond($response);
    }

    /**
     * @param $input
     * @param array $rules
     * @param array $messages
     * @return bool
     */
    public function validateRequest($input, array $rules, array $messages =[]): bool {
        $this->validator = Services::Validation()->setRules($rules);
        // If you replace the $rules array with the name of the group
        if (is_string($rules)) {
            $validation = config('Validation');

            // If the rule wasn't found in the \Config\Validation, we
            // should throw an exception so the developer can find it.
            if (!isset($validation->$rules)) {
                throw ValidationException::forRuleNotFound($rules);
            }

            // If no error message is defined, use the error message in the Config\Validation file
            if (!$messages) {
                $errorName = $rules . '_errors';
                $messages = $validation->$errorName ?? [];
            }

            $rules = $validation->$rules;
        }

        return $this->validator->setRules($rules, $messages)->run($input);
    }

    /**
     * @param IncomingRequest $request
     * @return array|bool|float|int|mixed|object|string|null
     */
    public function getRequestInput(IncomingRequest $request): mixed {
        $input = $request->getPost();

        if (empty($input)) {
            //convert request body to associative array
            $input = json_decode($request->getBody(), true);
        }

        return $input;
    }

    /**
     * @return ResponseInterface
     */
    protected function responseAuth(): ResponseInterface {
        return $this->respond([
            'session' => $this->session->id,
            'auth'    => $this->session->isAuth,
            'user'    => $this->session->user,
            'token'   => generateAuthToken($this->session->user->email),
        ]);
    }
}