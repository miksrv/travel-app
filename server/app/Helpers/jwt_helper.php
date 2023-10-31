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
    $tokenTimeToLive = getenv('JWT_TIME_TO_LIVE') || 15;
    $tokenExpiration = $issuedAtTime + ($tokenTimeToLive * 1000 * 60);

    $payload = [
        'email' => $email,
        'iat'   => $issuedAtTime,
        'exp'   => $tokenExpiration,
    ];

    return JWT::encode($payload, Services::getSecretKey(), 'HS256');
}

/**
 * @param string $password
 * @return string
 */
function hashUserPassword(string $password): string {
    return password_hash($password, PASSWORD_ARGON2ID);
}