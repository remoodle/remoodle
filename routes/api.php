<?php

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Slim\App;
use App\Controllers\AuthController;
use App\Controllers\SettingsController;
use App\Models\MoodleUser;

return function(App $app){
    $app->get("/api/healthcheck", function(RequestInterface $request, ResponseInterface $response){
        $response->getBody()->write(json_encode(["status" => "ok", "message" => "pong"]));
        return $response->withAddedHeader("Content-Type", "application/json");
    });

    $app->post("/api/auth/register", [AuthController::class, "register"]);
    
    $app->get("/api/user/{token}/settings", [SettingsController::class, "getUserSetiings"]);
};