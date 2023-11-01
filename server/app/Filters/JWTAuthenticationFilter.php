<?php namespace App\Filters;

use CodeIgniter\API\ResponseTrait;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;
use Exception;

class JWTAuthenticationFilter implements FilterInterface {
    use ResponseTrait;

    /**
     * @param RequestInterface $request
     * @param $arguments
     * @return RequestInterface|ResponseInterface|true
     */
    public function before(RequestInterface $request, $arguments = null): ResponseInterface|RequestInterface|bool {
        if (
            $request->getUri()->getPath() === 'auth/register' ||
            $request->getUri()->getPath() === 'auth/login'
        ) {
            return true;
        }

        $authenticationHeader = $request->getServer('HTTP_AUTHORIZATION') || null;

        try {

            helper('jwt');
            validateJWTFromRequest($authenticationHeader);

            return $request;

        } catch (Exception $e) {

            return Services::response()
                ->setJSON(['error' => $e->getMessage()])
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }
    }

    /**
     * @param RequestInterface $request
     * @param ResponseInterface $response
     * @param $arguments
     * @return void
     */
    public function after(
        RequestInterface $request,
        ResponseInterface $response,
        $arguments = null
    ) {

    }
}