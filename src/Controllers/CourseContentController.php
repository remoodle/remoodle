<?php 

namespace App\Controllers;

use App\Modules\Moodle\Moodle;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class CourseContentController extends BaseController
{

    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $userMoodleRepository
    ){}

    //TODO: REFACTOR
    public function getCourse(Request $request, Response $response, array $args): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute('user');
        
        $course = $this->userMoodleRepository->getActiveCourses(
            moodleId: $user->moodle_id, 
            moodleToken: $user->moodle_token
        )->keyBy('course_id')[$args['id']];
        
        $course['content'] = Moodle::createFromToken(
            moodleId: $user->moodle_id,
            token: $user->moodle_token 
        )->getWrapper()
        ->getCoursesInfo((int)$args['id']);

        $response->getBody()->write(json_encode($course));

        return $response->withHeader("Content-Type", "application/json");
    }
}
