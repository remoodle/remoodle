<?php

namespace App\Controllers;

use App\Modules\Auth\Auth;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\Task\Task;

class AuthController
{
    public function __construct(
        private Auth $auth
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
            $user->makeHidden(["password_hash", "moodle_token"])
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
        $token = $this->auth->authPassword($requestBody);

        if($token === null){
            throw new \Exception("Invalid credentials.", StatusCodeInterface::STATUS_UNAUTHORIZED);
        }

        $response->getBody()->write(json_encode([
            "token" => $token
        ]));

        return $response
            ->withHeader("Content-Type", "application/json")
            ->withStatus(StatusCodeInterface::STATUS_OK);
    }

}