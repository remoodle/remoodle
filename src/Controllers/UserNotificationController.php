<?php 

namespace App\Controllers;

use App\Models\Notification;
use Illuminate\Database\Connection;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UserNotificationController
{
    public function __construct(
        private Connection $connection
    ){}

    public function getUpdates(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");
        $user->load("notifications");

        $this->connection->beginTransaction();
        try {
            $response->getBody()->write(json_encode([$user->notifications]));
            Notification::where("moodle_id", $user->moodle_id)->delete();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }

        $this->connection->commit();
        return $response->withHeader("Content-Type","application/json");
    }
}
