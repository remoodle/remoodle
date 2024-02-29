<?php 

namespace App\Controllers;

use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Psr\Http\Message\ResponseInterface;

class SettingsController
{
    const TOKEN_HEADER = "Auth-Token";

    public function userSetiings(Request $request, Response $response): ResponseInterface
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        $response->getBody()->write(json_encode([
            'moodle_id' => $user->moodle_id,
            'name' => $user->name,
            'barcode' => $user->barcode,
            'name_alias' => $user->name_alias,
            'has_password' => $user->password_hash ? true : false,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'notify_method' => $user->notify_method,
            'webhook_secret' => $user->webhook_secret,
        ]));

        return $response->withHeader("Content-Type", "application/json")->withStatus(200);
    }

}
