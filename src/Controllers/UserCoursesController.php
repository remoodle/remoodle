<?php 

namespace App\Controllers;

use App\Modules\Moodle\Moodle;
use App\Repositories\UserMoodle\UserMoodleRepositoryFactory;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class UserCoursesController
{
    public function __construct(
        private UserMoodleRepositoryFactory $userMoodleRepositoryFactory
    ){}

    public function getCourses(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $user = $request->getAttribute("user");

        $moodleUserRepository = $this
            ->userMoodleRepositoryFactory
            ->create(isset($queryParams["offline"]));
        
        $response->getBody()->write(json_encode(
            $moodleUserRepository->getActiveCourses(
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
        $moodleUserRepository = $this
            ->userMoodleRepositoryFactory
            ->create(isset($queryParams["offline"]));

        try {
            $response->getBody()->write(json_encode(
                $moodleUserRepository->getCourseGrades(
                    $user->moodle_id, 
                    $user->moodle_token, 
                    (int)$queryParams["course_id"]
                )
            ));
        } catch (\Throwable $th) {
            if($th->getMessage() === "Course or activity not accessible."){
                throw new \Exception("Invalid course id.", StatusCodeInterface::STATUS_BAD_REQUEST);
            }
            
            throw $th;;
        }

        return $response->withHeader("Content-Type", "application/json");
    }

    public function getCourseGrades(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $user = $request->getAttribute("user");
        $moodleUserRepository = $this
            ->userMoodleRepositoryFactory
            ->create(isset($queryParams["offline"]));

        try {
            $response->getBody()->write(json_encode(
                $moodleUserRepository->getCourseGrades(
                    $user->moodle_id, 
                    $user->moodle_token, 
                    (int)$queryParams["course_id"]
                )
            ));
        } catch (\Throwable $th) {
            if($th->getMessage() === "Course or activity not accessible."){
                throw new \Exception("Invalid course id.", StatusCodeInterface::STATUS_BAD_REQUEST);
            }
            
            throw $th;;
        }

        return $response->withHeader("Content-Type", "application/json");
    }

}
