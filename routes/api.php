<?php

declare(strict_types=1);

use App\Middleware\SearchQueryReplace;
use App\Middleware\Validation\VerifyUserEmail;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Slim\App;
use App\Controllers\AuthController;
use App\Controllers\CourseContentController;
use App\Controllers\SearchController;
use App\Controllers\SettingsController;
use App\Controllers\UserCoursesController;
use App\Controllers\UtilityController;
use App\Middleware\Auth;
use App\Middleware\CourseAssign;
use App\Middleware\EncodeGzip;
use App\Middleware\Validation\AuthPassword;
use App\Middleware\Validation\ChangeUserSettings;
use App\Middleware\Validation\GenerateToken;
use App\Middleware\Validation\GetAuthOptions;
use App\Middleware\Validation\GetCourseContent;
use App\Middleware\Validation\RegisterOrShow;
use App\Middleware\Validation\ValidateSearch;
use Slim\Routing\RouteCollectorProxy;

return function (App $app) {
    $app->get("/health", function (RequestInterface $request, ResponseInterface $response) {
        $response->getBody()->write(json_encode(["status" => "ok", "message" => "pong"]));
        return $response->withAddedHeader("Content-Type", "application/json");
    });

    $app->group("/v1", function (RouteCollectorProxy $api) {
        $api->group("/user", function (RouteCollectorProxy $user) {
            $user->get("/settings", [SettingsController::class, "getSettings"]);
            $user->post("/settings", [SettingsController::class, "changeSettings"])->add(ChangeUserSettings::class);
            $user->delete("", [SettingsController::class, "deleteUser"]);

            $user->get("/deadlines", [UserCoursesController::class, "getDeadlines"]);

            $user->get("/courses", [UserCoursesController::class, "getCourses"]);
            $user->get("/courses/overall-grades", [UserCoursesController::class, "getCoursesOverallGrades"]);
            $user->get("/courses/overall", [UserCoursesController::class, "getUserOverall"]);

            $user->get("/course/{course}/grades", [UserCoursesController::class, "getCourseGrades"])->add(CourseAssign::class); //grades

            // $user->get("event/{instance}", [UserCoursesController::class, "getEventByInstance"]);
            // $user->get("assignment/{cmid}", [UserCoursesController::class, "getAssignmentByCmid"]);
            // $user->get("grade/{cmid}", [UserCoursesController::class, "getGradeByCmid"]);

        })->add(Auth::class);

        $api->group("/course", function (RouteCollectorProxy $course) {
            $course->get("/{course}", [CourseContentController::class, "getCourse"])->add(GetCourseContent::class)->add(CourseAssign::class);
            $course->get("/{course}/assignments", [CourseContentController::class, "getCourseAssignments"])->add(CourseAssign::class);
        })->add(Auth::class);

        $api->group("/auth", function (RouteCollectorProxy $auth) {
            $auth->post("/register", [AuthController::class, "register"]);
            $auth->post("/options", [AuthController::class, "getAuthOptions"])->add(GetAuthOptions::class);
            $auth->post("/password", [AuthController::class, "authPassword"])->add(AuthPassword::class);
            $auth->post("/token", [AuthController::class, "registerOrShow"])->add(RegisterOrShow::class);
            // $auth->post("/code/webhook", [AuthController::class, "authPassword"])->add(AuthPassword::class);
            // $auth->post("/code/custom", [AuthController::class, "authPassword"])->add(AuthPassword::class);

        });

        $api->group("/utility", function (RouteCollectorProxy $utility) {
            $utility->post("/generate-token", [UtilityController::class, "generateToken"])->add(GenerateToken::class);
        });

        $api->post("/search", [SearchController::class, "search"])
            ->add(Auth::class)
            ->add(ValidateSearch::class)
            ->add(SearchQueryReplace::class);
    });

};
