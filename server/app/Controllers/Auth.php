<?php namespace App\Controllers;

use App\Entities\User;
use App\Libraries\LocaleLibrary;
use App\Libraries\SessionLibrary;
use App\Models\UsersModel;
use CodeIgniter\Files\File;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Validation\Exceptions\ValidationException;
use Config\Services;
use Exception;
use Google_Client;
use Google_Service_Oauth2;
use ReflectionException;

define('AUTH_TYPE_NATIVE', 'native');
define('AUTH_TYPE_GOOGLE', 'google');

class Auth extends ResourceController {
    public function __construct() {
        new LocaleLibrary();
    }

    /**
     * Register a new user
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function registration(): ResponseInterface {
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

        $session = new SessionLibrary();
        $session->authorization($user);

        return $this->respond([
            'auth'  => $session->isAuth,
            'user'  => $session->user,
            'token' => generateAuthToken($session->user->email),
        ]);
    }

    /**
     * Google auth
     * @link https://console.developers.google.com/
     * @link https://www.webslesson.info/2020/03/google-login-integration-in-codeigniter.html
     * @throws ReflectionException
     */
    public function google(): ResponseInterface {
        $googleClient = new Google_Client();

        $googleClient->setClientId(getenv('auth.google.clientID'));
        $googleClient->setClientSecret(getenv('auth.google.secret'));
        $googleClient->setRedirectUri(getenv('auth.google.redirect'));
        $googleClient->addScope('email');
        $googleClient->addScope('profile');

        $authCode = $this->request->getGet('code', FILTER_SANITIZE_SPECIAL_CHARS);

        // If there is no authorization code, then the user has not yet logged in to Google.
        if (!$authCode) {
            return $this->respond([
                'auth'     => false,
                'redirect' => $googleClient->createAuthUrl(),
            ]);
        }

        $token = $googleClient->fetchAccessTokenWithAuthCode($authCode);

        if (isset($token['error'])) {
            log_message('error', '{error}', ['error' => $token['error']]);
            return $this->failValidationErrors('Google login error');
        }

        $googleClient->setAccessToken($token['access_token']);
        $googleService = new Google_Service_Oauth2($googleClient);
        $googleUser    = $googleService->userinfo->get();

        // If we have not received the user's email, we return an error
        if (!$googleUser->email) {
            log_message('error', 'When trying to authorize via Google API, the users email did not arrive');
            return $this->failValidationErrors('Google login error');
        }

        // Successful authorization, look for a user with the same email in the database
        $userModel = new UsersModel();
        $userData  = $userModel->findUserByEmailAddress($googleUser->getEmail());

        // If there is no user with this email, then register a new user
        if (!$userData) {
            $user   = new User();
            $avatar = '';

            $user->name      = $googleUser->getName();
            $user->email     = $googleUser->getEmail();
            $user->auth_type = AUTH_TYPE_GOOGLE;
            $user->locale    = $googleUser->getLocale() === 'ru' ? 'ru' : 'en';
            $user->level     = 1;

            $userModel->insert($user);

            // If a Google user has an avatar, copy it
            if ($googleUser->getPicture()) {
                $newUserId = $userModel->getInsertID();
                $avatarDirectory = UPLOAD_AVATARS . '/' . $newUserId . '/';
                $avatar = md5($googleUser->getName() . AUTH_TYPE_GOOGLE . $googleUser->getEmail()) . '.jpg';

                if (!is_dir($avatarDirectory)) {
                    mkdir($avatarDirectory,0777, TRUE);
                }

                file_put_contents($avatarDirectory . $avatar, file_get_contents($googleUser->getPicture()));

                $file = new File($avatarDirectory . $avatar);
                $name = pathinfo($file, PATHINFO_FILENAME);
                $ext  = $file->getExtension();

                $image = Services::image('gd'); // imagick
                $image->withFile($file->getRealPath())
                    ->fit(40, 40, 'center')
                    ->save($avatarDirectory  . $name . '_preview.' . $ext);

                $userModel->update($newUserId, ['avatar' => $avatar]);
            }

            log_message('error', 'New user registered via Google');

            $userData = $user;
        }

        // All migrated users will not have an authorization type in the database, so it will be possible to
        // either recover the password or log in through Google or another system.
        // But if the authorization type is already specified, you should authorize only this way.
        if ($userData->type !== null && $userData->type !== AUTH_TYPE_GOOGLE) {
            log_message('error', 'The user cannot log in because he has a different type of account authorization');
            return $this->failValidationErrors('You have a different authorization type set to Google');
        }

        if ($userData->type !== AUTH_TYPE_GOOGLE) {
            $userModel->update($userData->id, ['auth_type' => AUTH_TYPE_GOOGLE]);
        }

        $session = new SessionLibrary();
        $session->authorization($userData);

        return $this->respond([
            'auth'  => $session->isAuth,
            'user'  => $session->user,
            'token' => generateAuthToken($session->user->email),
        ]);
    }

    /**
     * Authenticate Existing User
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function login(): ResponseInterface {
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

        $session   = new SessionLibrary();
        $userModel = new UsersModel();
        $userData  = $userModel->findUserByEmailAddress($input['email']);
        $session->authorization($userData);

        return $this->respond([
            'auth'  => $session->isAuth,
            'user'  => $session->user,
            'token' => generateAuthToken($session->user->email),
        ]);
    }

    /**
     * @throws Exception
     */
    public function me(): ResponseInterface {
        $session = new SessionLibrary();
        $session->update();

        $response = (object) ['auth' => $session->isAuth];

        if ($session->isAuth && $session->user) {
            $response->user  = $session->user;
            $response->token = generateAuthToken($session->user->email);
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
}