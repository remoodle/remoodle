<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\UserMoodle\RepositoryTypes;
use App\Repositories\UserMoodle\UserMoodleRepositoryFactory;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class UserCoursesController extends BaseController
{
    public function __construct(
        private UserMoodleRepositoryFactory $userMoodleRepositoryFactory,
    ) {
    }

    public function getCoursesOverallGrades(Request $request, Response $response): Response
    {
        $user = $request->getAttribute("user");
        $user->load([
            'courses',
            'courses.grades' => function ($query) use ($user) {
                $query->whereNull('cmid')->where('moodle_id', $user->moodle_id);
            }
        ]);

        foreach ($user->courses as $userCourse) {
            $userCourse->grades->makeHidden(['laravel_through_key', 'moodle_id']);
        }

        return $this->jsonResponse(
            $response,
            200,
            $user->courses
        );
    }

    public function getCourses(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        $noOnline = isset($request->getQueryParams()['noOnline'])
            ? (bool) $request->getQueryParams()['noOnline']
            : false
        ;

        $status = isset($request->getQueryParams()['status'])
            ? CourseEnrolledClassification::from($request->getQueryParams()['status'])
            : null
        ;

        if ($noOnline && !$user->initialized) {
            throw new \Exception('Can\'t get data from database', 503);
        }

        return $this->jsonResponse(
            response: $response,
            body: $this->userMoodleRepositoryFactory->create(
                $user->initialized ? RepositoryTypes::DATABASE : RepositoryTypes::MOODLE_API
            )->getCourses($user->moodle_id, $user->moodle_token, $status)
        );
    }

    public function getCourseGrades(Request $request, Response $response, array $args): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        return $this->jsonResponse(
            response: $response,
            body: $this->userMoodleRepositoryFactory->create(
                $user->initialized ? RepositoryTypes::DATABASE : RepositoryTypes::MOODLE_API
            )->getCourseGrades(
                moodleId: $user->moodle_id,
                moodleToken: $user->moodle_token,
                courseId: (int)$args['course']
            )
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

        $noOnline = isset($request->getQueryParams()['noOnline'])
            ? (bool) $request->getQueryParams()['noOnline']
            : false
        ;

        $status = isset($request->getQueryParams()['status'])
            ? CourseEnrolledClassification::from($request->getQueryParams()['status'])
            : null
        ;

        if ($noOnline && !$user->initialized) {
            throw new \Exception('Can\'t get data from database', 503);
        }

        if ($user->initialized) {
            $user->load([
                "courses" => function ($query) use ($status) {
                    if ($status !== null) {
                        $query->where('status', $status->value);
                    }
                },
                "courses.grades" => function ($query) use ($user) {
                    $query->where("moodle_id", $user->moodle_id);
                },
            ]);

            foreach ($user->courses as $userCourse) {
                $userCourse->grades->makeHidden(['laravel_through_key', 'moodle_id']);
            }

            return $this->jsonResponse(
                response: $response,
                body: $user->courses
            );
        }

        $repository = $this->userMoodleRepositoryFactory->create(RepositoryTypes::MOODLE_API);
        return $this->jsonResponse(
            response: $response,
            body:
                $repository->getCourses(
                    $user->moodle_id,
                    $user->moodle_token,
                    CourseEnrolledClassification::INPROGRESS
                ),
        );
    }

}
