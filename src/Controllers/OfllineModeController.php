<?php 

namespace App\Controllers;

use App\Models\MoodleUser;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class OfllineModeController
{
    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $databaseUserMoodleRepository
    ){}

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
}
