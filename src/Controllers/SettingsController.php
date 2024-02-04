<?php 

namespace App\Controllers;

use App\Models\MoodleUser;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Psr\Http\Message\ResponseInterface;

class SettingsController
{
    public function getUserSetiings(Request $request, Response $response, array $args): ResponseInterface
    {
        if(!isset($args["token"])){
            //error
        }
        
        $token = $args["token"];
        $user = MoodleUser::where("moodle_token", $token)->first();

        if(!$user){
            //error
        }

        $response->getBody()->write(json_encode([
            'grades_notification' => $user->grades_notification,
            'deadlines_notification' => $user->deadlines_notification
        ]));

        return $response->withHeader("Content-Type", "application/json")->withStatus(200);
    }
}
