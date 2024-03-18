<?php

use App\Controllers\OfllineModeController;
use App\Middleware\Validation\ChangeEmail;
use App\Middleware\Validation\VerifyUserEmail;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Slim\App;
use App\Controllers\AuthController;
use App\Controllers\SettingsController;
use App\Controllers\UserCoursesController;
use App\Middleware\Auth;
use App\Middleware\Validation\AuthPassword;
use App\Middleware\Validation\GetAuthOptions;
use App\Middleware\Validation\GetCourseGrades;
use Slim\Routing\RouteCollectorProxy;

return function(App $app){
    $app->get("/api/healthcheck", function(RequestInterface $request, ResponseInterface $response){
        $response->getBody()->write(json_encode(["status" => "ok", "message" => "pong"]));
        return $response->withAddedHeader("Content-Type", "application/json");
    });

    $app->group("/api", function(RouteCollectorProxy $api){
        $api->group("/user", function(RouteCollectorProxy $user){
            $user->get("/settings", [SettingsController::class, "userSetiings"]); //done
            $user->get("/email-verifications", [SettingsController::class, "getUserEmailVerifications"]);
            $user->post("/email-verification", [SettingsController::class, "verifyUserEmail"])->add(VerifyUserEmail::class);
            $user->post("/email-change", [SettingsController::class, "changeUserEmail"])->add(ChangeEmail::class);

            $user->get("/course/grades", [UserCoursesController::class, "getCourseGrades"])->add(GetCourseGrades::class); //grades 
            $user->get("/courses", [UserCoursesController::class, "getCourses"]); 
            $user->get("/deadlines", [UserCoursesController::class, "getDeadlines"]); 

            $user->group("/offline", function(RouteCollectorProxy $offline){
                $offline->get("/courses/overall", [OfllineModeController::class, "getUserOverall"]);
            });
            
        })->addMiddleware($api->getContainer()->get(Auth::class));

        $api->group("/auth", function(RouteCollectorProxy $auth){
            $auth->post("/register", [AuthController::class, "register"]);
            $auth->post("/options", [AuthController::class, "getAuthOptions"])->add(GetAuthOptions::class);
            $auth->post("/password", [AuthController::class, "authPassword"])->add(AuthPassword::class);
        });
    });

};