<?php

namespace App\Controllers;

use App\Models\MoodleUser;
use App\Repositories\UserMoodle\ApiUserMoodleRepositoryInterface;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\Task\Task;

class AuthController
{
    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $databaseUserRepository,
        private ApiUserMoodleRepositoryInterface $apiUserRepository,
    ){}

    const IDENTIFIER_BARCODE = "barcode";
    const IDENTIFIER_ALIAS = "name_alias";

    public function register(Request $request, Response $response): Response
    {
        $requestBody = $request->getParsedBody();
        
        if($this->databaseUserRepository->findByIdentifiers(
            token: $request->getAttribute("token", null),
            email: $request->getAttribute("email", null),
            nameAlias: $request->getAttribute("name_alias", null)
        )){
            throw new \Exception("Already have user with given token.", StatusCodeInterface::STATUS_CONFLICT);
        }

        try {
            $baseMoodleUser = $this->apiUserRepository->getUserInfo($requestBody["token"]);
        } catch (\Throwable $th) {
            throw new \Exception("Given token is invalid or Moodle webservice is down.", StatusCodeInterface::STATUS_BAD_REQUEST);
        }

        $user = MoodleUser::createFromBaseMoodleUser(
            $baseMoodleUser, 
            isset($requestBody["password"]) 
                ? MoodleUser::hashPassword($requestBody["password"])
                : null,
            isset($requestBody[static::IDENTIFIER_ALIAS]) 
                ? $requestBody[static::IDENTIFIER_ALIAS]
                : null, 
        );
        
        $response->getBody()->write(json_encode(
            $user
            ->makeHidden("password_hash")
            ->toArray()
        ));

        $jobs = new Jobs(
            RPC::create('tcp://127.0.0.1:6001')
        );
        $queue = $jobs->connect('user_registered');
        $task = $queue->create(Task::class, $user->toJson());
        $queue->dispatch($task);
        
        return $response->withHeader("Content-Type", "application/json")->withStatus(StatusCodeInterface::STATUS_OK);
    }

    public function authByPassword(Request $request, Response $response): Response
    {
        return $response;
    }
}