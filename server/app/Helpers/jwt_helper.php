<?php

use App\Models\UsersModel;
use Config\Services;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * @param string $encodedToken
 * @return object|array
 */
function validateJWTFromRequest(string $encodedToken): object|array {
    if (!$encodedToken) {
        return [];
    }

    $secretKey    = Services::getSecretKey();
    $decodedToken = JWT::decode($encodedToken, new Key($secretKey, 'HS256'));

    $userModel = new UsersModel();

    return $userModel->findUserByEmailAddress($decodedToken->email);
}

/**
 * @param string $email
 * @return string
 */
function getSignedJWTForUser(string $email): string {
    $issuedAtTime    = time();
    $tokenTimeToLive = getenv('JWT_TIME_TO_LIVE');
    $tokenExpiration = $issuedAtTime + $tokenTimeToLive;

    $payload = [
        'email' => $email,
        'iat' => $issuedAtTime,
        'exp' => $tokenExpiration,
    ];

    return JWT::encode($payload, Services::getSecretKey(), 'HS256');
}