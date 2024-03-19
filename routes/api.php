<?php

use App\Controllers\OfllineModeController;
use App\Controllers\UserNotificationController;
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
            // $user->post("/email-change", [SettingsController::class, "changeUserEmail"])->add(ChangeEmail::class);

            $user->get("/course/{course}/contents", [UserCoursesController::class, "getCourseContents"]); 
            $user->get("/course/{course}/grades", [UserCoursesController::class, "getCourseGrades"]); //grades 
            $user->get("/courses", [UserCoursesController::class, "getCourses"]); 
            $user->get("/deadlines", [UserCoursesController::class, "getDeadlines"]); 
            $user->get("/courses/overall", [OfllineModeController::class, "getUserOverall"]);
            
            $user->get("/updates", [UserNotificationController::class,"getUpdates"]);
        })->addMiddleware($api->getContainer()->get(Auth::class));

        $api->group("/auth", function(RouteCollectorProxy $auth){
            $auth->post("/register", [AuthController::class, "register"]);
            $auth->post("/options", [AuthController::class, "getAuthOptions"])->add(GetAuthOptions::class);
            $auth->post("/password", [AuthController::class, "authPassword"])->add(AuthPassword::class);
            // $auth->post("/code/webhook", [AuthController::class, "authPassword"])->add(AuthPassword::class);
            // $auth->post("/code/email", [AuthController::class, "authPassword"])->add(AuthPassword::class);
            // $auth->post("/code/custom", [AuthController::class, "authPassword"])->add(AuthPassword::class);

        });
    });

};