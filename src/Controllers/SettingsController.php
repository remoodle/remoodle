<?php

namespace App\Controllers;

use App\Models\MoodleUser;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Carbon\Carbon;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Connection;
use Spiral\RoadRunner\KeyValue\StorageInterface;

class SettingsController extends BaseController
{
    public function __construct(
        private Connection $connection,
        private DatabaseUserMoodleRepositoryInterface $userRepository,
        private StorageInterface $kvStorage
    ) {
    }

    public const TOKEN_HEADER = "Auth-Token";

    public function getSettings(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        return $this->jsonResponse(
            response: $response,
            body: $user->makeHidden(['password_hash', 'webhook_secret'])
        );
    }

    public function changeSettings(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");
        $body = $request->getParsedBody();

        if($this->userRepository->findByIdentifiers(nameAlias: $body['name_alias']) !== null) {
            throw new \Exception('Name alias is taken', 400);
        }

        $user->update([
            'name_alias' => $body['name_alias'] ?? $user->name_alias,
            'password_hash' => isset($body['password']) ? MoodleUser::hashPassword($body['password']) : $user->password_hash,
            'deadlines_notification' => (bool)$body['deadlines_notification'] ?? $user->deadlines_notification,
            'grades_notification' => (bool)$body['grades_notification'] ?? $user->grades_notification,
        ]);

        $this->kvStorage->set($user->moodle_token, $user);

        return $this->jsonResponse(
            response: $response,
            body: $user->makeHidden(['password_hash', 'webhook_secret'])
        );
    }

    //TODO: REFACTOR
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

    //TODO: REFACTOR
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

        if($emailCode === null || Carbon::now()->greaterThan(Carbon::parse($emailCode->expires_at))) {
            throw new \Exception("User email verification not found", 404);
        }

        if($emailCode->code !== $code) {
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
