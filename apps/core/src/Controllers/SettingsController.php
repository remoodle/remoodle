<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\MoodleUser;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
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
            body: [
                'moodle_id' => $user->moodle_id,
                'name' => $user->name,
                'username' => $user->username,
                'name_alias' => $user->name_alias,
                'has_password' => (bool)$user->password_hash
            ]
        );
    }

    public function changeSettings(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");
        $body = $request->getParsedBody();

        if ($this->userRepository->findByIdentifiers(nameAlias: $body['name_alias']) !== null) {
            throw new \Exception('Name alias is taken', 400);
        }

        $user->update([
            'name_alias' => $body['name_alias'] ?? $user->name_alias,
            'password_hash' => isset($body['password']) ? MoodleUser::hashPassword($body['password']) : $user->password_hash,
        ]);

        $this->kvStorage->set($user->moodle_token, $user);
        $this->kvStorage->set('m'.$user->moodle_id, $user->moodle_token);

        return $this->jsonResponse(
            response: $response,
            body: $user->makeHidden(['password_hash'])
        );
    }

    public function deleteUser(Request $request, Response $response): Response
    {
        /**@var \App\Models\MoodleUser */
        $user = $request->getAttribute("user");

        try {
            $this->connection->beginTransaction();
            $this->kvStorage->delete($user->moodle_token);
            $this->kvStorage->delete('m'.$user->moodle_id);
            $user->delete();
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->kvStorage->set($user->moodle_token, $user);
            $this->kvStorage->set('m'.$user->moodle_id, $user->moodle_token);
            $this->connection->rollBack();

            throw $th;
        }

        return $this->jsonResponse($response);
    }
}
