<?php namespace App\Controllers;

use App\Entities\User;
use App\Libraries\LocaleLibrary;
use App\Libraries\Session;
use App\Models\UsersModel;
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
        helper('jwt_helper');

        $validationRules = [
            'name'     => 'required|is_unique[users.name]',
            'email'    => 'required|min_length[6]|max_length[50]|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[8]|max_length[255]'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $validationRules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $userModel = new UsersModel();
        $userData  = new User();
        $userData->name     = $input['name'];
        $userData->email    = $input['email'];
        $userData->password = hashUserPassword($input['password']);

        $userModel->save($userData);

        return $this->getJWTForUser($userData);
    }

    /**
     * Google auth
     * @link https://console.developers.google.com/
     * @link https://www.webslesson.info/2020/03/google-login-integration-in-codeigniter.html
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

            // If a Google user has an avatar, copy it
            if ($googleUser->getPicture()) {
                $avatar = md5($googleUser->getName() . AUTH_TYPE_GOOGLE . $googleUser->getEmail()) . 'jpg';

                if (!is_dir(UPLOAD_AVATARS)) {
                    mkdir(UPLOAD_AVATARS,0777, TRUE);
                }

                file_put_contents(UPLOAD_AVATARS . '/' . $avatar, file_get_contents($googleUser->getPicture()));
            }

            $user->name      = $googleUser->getName();
            $user->email     = $googleUser->getEmail();
            $user->auth_type = AUTH_TYPE_GOOGLE;
            $user->locale    = $googleUser->getLocale() === 'ru' ? 'ru' : 'en';
            $user->avatar    = $avatar;

            $userModel->insert($user);
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

        // Authorize the user
        return $this->getJWTForUser($userData);
    }

    /**
     * Authenticate Existing User
     * @return ResponseInterface
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

        // Hash new password
//        helper('jwt_helper');
//        echo '<pre>';
//        var_dump(hashUserPassword($input['password']));
//        exit();

        if (!$this->validateRequest($input, $rules, $errors)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $userModel = new UsersModel();
        $userData  = $userModel->findUserByEmailAddress($input['email']);

        return $this->getJWTForUser($userData);
    }

    /**
     * @throws Exception
     */
    public function me(): ResponseInterface {
        $authenticationHeader = $this->request->getServer('HTTP_AUTHORIZATION');

        try {
            helper('jwt');

            $userData = validateJWTFromRequest($authenticationHeader);

            return $this->getJWTForUser($userData);

        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failUnauthorized();
        }
    }

    /**
     * @param User $userData
     * @return ResponseInterface
     */
    private function getJWTForUser(User $userData): ResponseInterface {
        try {
            helper('jwt');

            $session = new Session();
            $session->update($userData->id);

            unset($userData->password);

            return $this->respond([
                'auth'  => true,
                'user'  => $userData,
                'token' => getSignedJWTForUser($userData->email)
            ]);

        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->fail(['error' => $e->getMessage()], ResponseInterface::HTTP_OK);
        }
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