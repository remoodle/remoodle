<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Modules\Auth\Auth;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Spiral\RoadRunner\KeyValue\StorageInterface;

class AuthController extends BaseController
{
    public function __construct(
        private Auth $auth,
        private StorageInterface $storage,
    ) {
    }

    public function register(Request $request, Response $response): Response
    {
        return $this->jsonResponse(
            response: $response,
            status: StatusCodeInterface::STATUS_CREATED,
            body: $this
                ->auth
                ->register(
                    (array)$request->getParsedBody()
                )->makeHidden(["password_hash", "moodle_token"])
                ->toArray()
        );
    }

    public function getAuthOptions(Request $request, Response $response): Response
    {
        return $this->jsonResponse(
            response: $response,
            body: $this->auth->getAuthOptions((array)$request->getParsedBody())
        );
    }

    public function authPassword(Request $request, Response $response): Response
    {
        $user = $this->auth->authPassword((array)$request->getParsedBody());

        if ($user === null) {
            throw new \Exception("Invalid credentials.", StatusCodeInterface::STATUS_UNAUTHORIZED);
        }

        return $this->jsonResponse(
            response: $response,
            body: $user->makeHidden(["password_hash"])->toArray()
        );
    }

    public function registerOrShow(Request $request, Response $response): Response
    {
        $token = ((array)$request->getParsedBody())["token"];

        if (!($user = $this->storage->get($token))) {
            $user = $this->auth->register(['token' => $token]);
        }

        return $this->jsonResponse(
            response: $response,
            body: [
                'moodle_id' => $user->moodle_id,
                'name' => $user->name,
                'username' => $user->username,
                'name_alias' => $user->name_alias,
                "moodle_token" => $user->moodle_token
            ]
        );
    }
}
