<?php 

namespace App\Controllers;

use App\Modules\Moodle\Moodle;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class UserCoursesController extends BaseController
{
    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $userMoodleRepository
    ){}

    public function getCourses(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        return $this->jsonResponse(
            response: $response,
            body: $this->userMoodleRepository->getActiveCourses(
                moodleId: $user->moodle_id, 
                moodleToken: $user->moodle_token
            )->toArray()
        );  
    }

    public function getCourseGrades(Request $request, Response $response, array $args): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        return $this->jsonResponse(
            response: $response,
            body: $this->userMoodleRepository->getCourseGrades(
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
            body: $this->userMoodleRepository->getDeadlines(
                moodleId: $user->moodle_id, 
                moodleToken: $user->moodle_token
            )
        );
    }

    public function getUserOverall(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");
        $user->load([
            "courses", 
            "courses.grades" => function($query) use ($user){
                $query->where("moodle_id", $user->moodle_id);
            }
        ]);

        foreach($user->courses as $userCourse){
            $userCourse->grades->makeHidden(['laravel_through_key', 'moodle_id']);
        }

        return $this->jsonResponse(
            response: $response,
            body: $user->courses
        );
    }

}
