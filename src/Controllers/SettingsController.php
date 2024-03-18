<?php 

namespace App\Controllers;

use Carbon\Carbon;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Connection;

class SettingsController
{
    public function __construct(
        private Connection $connection,
    ){}

    const TOKEN_HEADER = "Auth-Token";

    public function userSetiings(Request $request, Response $response): Response
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

    public function getUserEmailVerifications(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");
        $emailCode = $user
            ->verifyCodes()
            ->where("type", "email_verify")
            ->orderBy("created_at", "desc")
            ->first();

        if($emailCode !== null && Carbon::now()->lessThan(Carbon::parse($emailCode->expires_at))) {
            $response->getBody()->write(json_encode([
                'uuid' => $emailCode->uuid,
                'created_at' => $emailCode->created_at,
                'expires_at' => $emailCode->expires_at,
            ]));
        }
        
        return $response->withHeader("Content-Type", "application/json")->withStatus(200);
    }

    public function verifyUserEmail(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");
        $code = intval($request->getParsedBody()['code']);
        $emailCode = $user
            ->verifyCodes()
            ->where("type", "email_verify")
            ->orderBy("created_at", "desc")
            ->first();
        
        if($emailCode === null || Carbon::now()->greaterThan(Carbon::parse($emailCode->expires_at))){
            throw new \Exception("User email verification not found", 404);
        }

        if($emailCode->code !== $code){
            echo "\n" . $emailCode->code;
            echo "\n" . $code;
            throw new \Exception("Not correct code", 400);
        }

        $this->connection->beginTransaction();
        try {
            $user->update([
                "email_verified_at" => Carbon::now()
            ]);

            $emailCode->update([
                'expires_at' => Carbon::now()
            ]);

        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }
        $response->getBody()->write("Email was verified");

        $this->connection->commit();
        return $response->withHeader("Content-Type", "application/json")->withStatus(200);
    }

}
