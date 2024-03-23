<?php 

namespace App\Controllers;

use App\Modules\Moodle\Moodle;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class CourseContentController extends BaseController
{
    //TODO: REFACTOR
    public function getCourse(Request $request, Response $response, array $args): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute('user');
        $response
            ->getBody()
            ->write(json_encode(Moodle::createFromToken(
                $user->moodle_token, 
                $user->moodle_id
                )->getWrapper()
                ->getCoursesInfo((int)$args['id'])
            ));

        return $response->withHeader("Content-Type", "application/json");
    }
}
