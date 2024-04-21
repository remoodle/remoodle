<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Modules\Moodle\Moodle;
use App\Repositories\UserMoodle\RepositoryTypes;
use App\Repositories\UserMoodle\UserMoodleRepositoryFactory;
use Illuminate\Database\Connection;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class UserCoursesController extends BaseController
{
    public function __construct(
        private UserMoodleRepositoryFactory $userMoodleRepositoryFactory,
        private Connection $connection
    ) {
    }

    public function getCourses(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        return $this->jsonResponse(
            response: $response,
            body: $this->userMoodleRepositoryFactory->create(
                false ? RepositoryTypes::DATABASE : RepositoryTypes::MOODLE_API
            )->getActiveCourses($user->moodle_id, $user->moodle_token)
        );
    }

    public function getCourseGrades(Request $request, Response $response, array $args): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        return $this->jsonResponse(
            response: $response,
            // body: $this->userMoodleRepositoryFactory->create(
            //     $user->initialized ? RepositoryTypes::DATABASE : RepositoryTypes::MOODLE_API
            // )->getCourseGrades(
            //     moodleId: $user->moodle_id,
            //     moodleToken: $user->moodle_token,
            //     courseId: (int)$args['course']
            // )
            body: Moodle::createFromToken($user->moodle_token, $user->moodle_id)->getWrapper()->getCourseGrades((int)$args['course'])
        );
    }

    public function getDeadlines(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        return $this->jsonResponse(
            response: $response,
            body: $this->userMoodleRepositoryFactory->create(
                $user->initialized ? RepositoryTypes::DATABASE : RepositoryTypes::MOODLE_API
            )->getDeadlines(
                moodleId: $user->moodle_id,
                moodleToken: $user->moodle_token,
            )
        );
    }

    //Will be removed
    public function getUserOverall(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");
        $user->load([
            "courses",
            "courses.grades" => function ($query) use ($user) {
                $query->where("moodle_id", $user->moodle_id);
            }
        ]);

        foreach($user->courses as $userCourse) {
            $userCourse->grades->makeHidden(['laravel_through_key', 'moodle_id']);
        }

        return $this->jsonResponse(
            response: $response,
            body: $user->courses
        );
    }

}
