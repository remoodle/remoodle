<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Modules\Moodle\Moodle;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use App\Repositories\UserMoodle\RepositoryTypes;
use App\Repositories\UserMoodle\UserMoodleRepositoryFactory;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class CourseContentController extends BaseController
{
    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $userMoodleRepository,
        private UserMoodleRepositoryFactory $userMoodleRepositoryFactory,
    ) {
    }

    //TODO: REFACTOR
    public function getCourse(Request $request, Response $response, array $args): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute('user');

        $courses = $this->userMoodleRepository->getActiveCourses(
            moodleId: $user->moodle_id,
            moodleToken: $user->moodle_token,
        );

        foreach($courses as $cours) { // - govno
            if($cours->course_id === (int)$args['course']) {
                $course = (array)$cours;
                break;
            }
        }

        if((bool)$request->getQueryParams()['content']) {
            $course['content'] = $this->userMoodleRepositoryFactory->create(
                $user->initialized ? RepositoryTypes::DATABASE : RepositoryTypes::MOODLE_API
            )->getCourseContents(
                moodleId: $user->moodle_id,
                moodleToken: $user->moodle_token,
                courseId: (int) $args['course']
            );
        }

        $response->getBody()->write(json_encode($course));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function getCourseAssignments(Request $request, Response $response, array $args): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute('user');

        return $this->jsonResponse(
            response: $response,
            body: $this->userMoodleRepositoryFactory->create(
                $user->initialized ? RepositoryTypes::DATABASE : RepositoryTypes::MOODLE_API
            )->getCourseAssigments(
                moodleId: $user->moodle_id,
                moodleToken: $user->moodle_token,
                courseId: (int) $args['course']
            )
        );
    }
}
