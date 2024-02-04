<?php

namespace App\Controllers;

use App\Models\MoodleUser;
use App\Modules\Moodle\Moodle;
use Slim\Psr7\Response;
use Slim\Psr7\Request;

class AuthController{
    public function __construct(
        private Moodle $moodle
    ){}

    public function generateCode()
    {
        
    }

    public function register(Request $request, Response $response): Response
    {
        $baseMoodleUser = Moodle::createFromToken($request->getParsedBody()["token"])->getUser();
        $userMoodle = MoodleUser::createFromBaseMoodleUser($baseMoodleUser);
        $response->getBody()->write(json_encode($userMoodle->toArray()));
        
        return $response->withHeader("Content-Type", "application/json")->withStatus(201);
    }
}