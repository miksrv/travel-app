<?php namespace App\Libraries;

use Config\Services;
use Random\RandomException;

/**
 * @link https://id.vk.com/about/business/go/accounts/
 * @link https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/api-integration/api-description#Poluchenie-cherez-kod-podtverzhdeniya
 */
class VkClient {
    private string $clientId;

    private string $redirectUri;

    private string $secret;
    private string $token;

    private string $theme;

    private string $secretState = 'VkontakteAPIClientAuth';
    private string $codeVerifier;

    private \CodeIgniter\HTTP\CURLRequest $client;

    /**
     * @param string $clientId
     * @param string $secret
     * @param string $redirectUri
     * @throws RandomException
     */
    public function __construct(string $clientId, string $secret, string $redirectUri, string $theme = 'light') {
        helper('text');

        $this->client = \Config\Services::curlrequest();

        $this->clientId    = $clientId;
        $this->secret      = $secret;
        $this->redirectUri = $redirectUri;
        $this->theme       = $theme === 'light' ? 'light' : 'dark';

        //random_bytes(32)

        $this->codeVerifier = rtrim(strtr(base64_encode('mySecretCode'), "+/", "-_"), "=");
    }


    /**
     * STEP 1: Create auth link
     * @return string
     */
    public function createAuthUrl(): string {
        $request = Services::request();
        $params  = [
            'response_type'  => 'code',
            'client_id'      => $this->clientId,
            'redirect_uri'   => $this->redirectUri,
            'code_challenge' => rtrim(strtr(base64_encode(hash("sha256", $this->codeVerifier, true)), "+/", "-_"), "="),

            'state'   => $this->secretState,
            'scope'   => 'email',
            'scheme'  => $this->theme,
            'lang_id' => $request->getLocale() === 'ru' ? 0 : 3,

            'code_challenge_method' => 's256',
        ];

        return 'https://id.vk.com/authorize?' . urldecode(http_build_query($params));
    }

    /**
     * STEP 2: Change auth code to auth token
     * @param $code
     * @param $state
     * @param $device
     * @return string
     */
    public function fetchAccessTokenWithAuthCode($code, $state, $device): string {
        if (!$code || !$device || $state !== $this->secretState) {
            return '';
        }

        $request = Services::request();
        $params  = [
            'grant_type'    => 'authorization_code',
            'code_verifier' => $this->codeVerifier,
            'redirect_uri'  => $this->redirectUri,
            'code'          => $code,
            'service_token' => $this->secret,
            'client_id'     => $this->clientId,
            'device_id'     => $device,
            'state'         => $state,
            'ip'            => $request->getIPAddress(),
        ];

        $response = $this->client
            ->setBody(http_build_query($params))
            ->post('https://id.vk.com/oauth2/auth');

        if ($response->getStatusCode() !== 200) {
            return '';
        }

        $response = json_decode($response->getBody());

        return $this->token = $response->access_token;
    }

    /**
     * STEP 3: Get user info
     * @return object|null
     */
    public function fetchUserInfo(): ?object {
        if (!$this->token) {
            return null;
        }

        // TODO: https://dev.vk.com/ru/method/users.get

        $params  = [
            'access_token' => $this->token,
            'client_id'    => $this->clientId
        ];

        $response = $this->client
            ->setBody(http_build_query($params))
            ->post('https://id.vk.com/oauth2/user_info');

        if ($response->getStatusCode() !== 200) {
            return null;
        }

        return json_decode($response->getBody());
    }
}
