<?php

use App\Entities\User;
use App\Models\UsersModel;
use Config\Services;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * @param string|null $encodedToken
 * @return User|null
 */
function validateJWTFromRequest(string $encodedToken = null):? User {
    if (!$encodedToken) {
        return null;
    }

    $userModel = new UsersModel();
    $secretKey = Services::getSecretKey();
    $decodedToken = JWT::decode($encodedToken, new Key($secretKey, 'HS256'));

    return $userModel->findUserByEmailAddress($decodedToken->email);
}

/**
 * @param string $email
 * @return string
 */
function getSignedJWTForUser(string $email): string {
    $issuedAtTime    = time();
    $tokenTimeToLive = getenv('JWT_TIME_TO_LIVE');
    $tokenExpiration = $issuedAtTime + ($tokenTimeToLive);

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