<?php

namespace App\Controllers;

use App\Modules\Auth\Auth;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Spiral\RoadRunner\KeyValue\StorageInterface;

class AuthController
{
    public function __construct(
        private Auth $auth,
        private StorageInterface $storage,
    ){}

    public function register(Request $request, Response $response): Response
    {
        $requestBody = $request->getParsedBody();
        
        try {
            $user = $this->auth->register($requestBody);
        } catch (\Throwable $th) {
            throw $th;
        }
        
        $response->getBody()->write(json_encode(
            $user->makeHidden(["password_hash", "moodle_token"])->toArray()
        ));

        return $response
            ->withHeader("Content-Type", "application/json")
            ->withStatus(StatusCodeInterface::STATUS_CREATED);
    }

    public function getAuthOptions(Request $request, Response $response): Response
    {
        $requestBody = $request->getParsedBody();
        
        try {
            $response->getBody()->write(json_encode($this
                ->auth
                ->getAuthOptions($requestBody)
            ));
        } catch (\Throwable $th) {
            throw $th;
        }

        return $response
            ->withHeader("Content-Type", "application/json")
            ->withStatus(StatusCodeInterface::STATUS_OK);
    }

    public function authPassword(Request $request, Response $response): Response
    {
        $requestBody = $request->getParsedBody();
        $user = $this->auth->authPassword($requestBody);

        if($user === null){
            throw new \Exception("Invalid credentials.", StatusCodeInterface::STATUS_UNAUTHORIZED);
        }

        $response->getBody()->write(json_encode(
            $user->makeHidden(["password_hash"])->toArray()
        ));

        return $response
            ->withHeader("Content-Type", "application/json")
            ->withStatus(StatusCodeInterface::STATUS_OK);
    }

    public function registerOrShow(Request $request, Response $response, array $args): Response
    {
        $token = $args['token'];

        $user = $this->storage->get($token);
        if(!$user){
            $user = $this->auth->register(['token' => $token]);
        }

        $response->getBody()->write(json_encode(
            $user->makeHidden(["password_hash", "moodle_token"])->toArray()
        ));

        return $response
            ->withHeader("Content-Type", "application/json")
            ->withStatus(StatusCodeInterface::STATUS_OK);
    }
}