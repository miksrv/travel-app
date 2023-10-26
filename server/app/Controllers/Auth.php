<?php namespace App\Controllers;

use App\Models\UsersModel;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Validation\Exceptions\ValidationException;
use Config\Services;
use Exception;
use ReflectionException;

class Auth extends ResourceController {
    /**
     * Register a new user
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function register(): ResponseInterface {
        $rules = [
            'name'     => 'required',
            'email'    => 'required|min_length[6]|max_length[50]|valid_email|is_unique[user.email]',
            'password' => 'required|min_length[8]|max_length[255]'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $userModel = new UsersModel();
        $userModel->save($input);

        return $this->getJWTForUser($input['email'], ResponseInterface::HTTP_CREATED);
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


        if (!$this->validateRequest($input, $rules, $errors)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        return $this->getJWTForUser($input['email']);
    }

    /**
     * @throws Exception
     */
    public function me(): ResponseInterface {
        $authenticationHeader = $this->request->getServer('HTTP_AUTHORIZATION');

        try {
            helper('jwt');
            $user = validateJWTFromRequest($authenticationHeader);

            return $this->respond(                    [
                'message'      => 'User authenticated successfully',
                'user'         => $user,
                'access_token' => getSignedJWTForUser($authenticationHeader)
            ], ResponseInterface::HTTP_OK);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failUnauthorized();
        }
    }

    /**
     * @param string $emailAddress
     * @param int $responseCode
     * @return ResponseInterface
     */
    private function getJWTForUser(string $emailAddress, int $responseCode = ResponseInterface::HTTP_OK): ResponseInterface {
        try {
            $model = new UsersModel();
            $user = $model->findUserByEmailAddress($emailAddress);
            unset($user['password']);

            helper('jwt');

            return $this
                ->respond(
                    [
                        'message'      => 'User authenticated successfully',
                        'user'         => $user,
                        'access_token' => getSignedJWTForUser($emailAddress)
                    ]
                );
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->fail(['error' => $e->getMessage()], $responseCode);
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