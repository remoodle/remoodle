<?php 

namespace App\Controllers;

use App\Modules\Moodle\Moodle;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class UserCoursesController
{
    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $userMoodleRepository
    ){}

    public function getCourses(Request $request, Response $response): Response
    {
        $user = $request->getAttribute("user");
        
        $response->getBody()->write(json_encode(
            $this->userMoodleRepository->getActiveCourses(
                $user->moodle_id, 
                $user->moodle_token
            )->toArray()
        ));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function getCoursesGrades(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $user = $request->getAttribute("user");

        $response->getBody()->write(json_encode(
            $this->userMoodleRepository->getCourseGrades(
                $user->moodle_id, 
                $user->moodle_token, 
                (int)$queryParams["course_id"]
            )
        ));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function getCourseGrades(Request $request, Response $response, array $args): Response
    {
        $courseId = (int)$args['course'];
        $user = $request->getAttribute("user");

        $response->getBody()->write(json_encode(
            $this->userMoodleRepository->getCourseGrades(
                $user->moodle_id, 
                $user->moodle_token, 
                $courseId
            )
        ));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function getDeadlines(Request $request, Response $response): Response
    {
        $user = $request->getAttribute("user");
        $response->getBody()->write(json_encode($this->userMoodleRepository->getDeadlines($user->moodle_id, $user->moodle_token)));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function getUserOverall(Request $request, Response $response): Response
    {
        $user = $request->getAttribute("user", null);
        $response->getBody()->write(json_encode(
            $user?->load(["courses", "courses.grades" => function($query) use ($user){
                $query->where("moodle_id", $user->moodle_id);
            }])
        ));
        return $response->withHeader("Content-Type", "application/json")->withStatus(200);
    }

    //TODO: REFACTOR
    public function getCourseContents(Request $request, Response $response, array $args): Response
    {
        $courseId = (int)$args['course'];
        $user = $request->getAttribute('user');
        $response
            ->getBody()
            ->write(json_encode(Moodle::createFromToken(
                $user->moodle_token, 
                $user->moodle_id
                )->getWrapper()
                ->getCoursesInfo($courseId)
            ));

        return $response->withHeader("Content-Type", "application/json");
    }

}
