<?php

declare(strict_types=1);

namespace App\Modules\Auth;

use App\Models\MoodleUser;
use App\Models\VerifyCode;
use App\Modules\Auth\Enums\AuthOptions;
use App\Modules\Jobs\Factory as JobsFactory;
use App\Modules\Jobs\JobsEnum;
use App\Modules\Notification\Bridge;
use App\Modules\Notification\Message;
use App\Repositories\UserMoodle\ApiUserMoodleRepositoryInterface;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Carbon\Carbon;
use Core\Config;
use Fig\Http\Message\StatusCodeInterface;
use Illuminate\Database\Connection;
use Queue\Payload\Payload;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Task\Task;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

class Auth
{
    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $databaseUserRepository,
        private ApiUserMoodleRepositoryInterface $apiUserRepository,
        private Bridge $notificationBridge,
        private Connection $connection,
        private JobsFactory $jobsFactory,
    ) {
    }

    public const IDENTIFIER_USERNAME = "username";
    public const IDENTIFIER_ALIAS = "name_alias";

    private function getUserAuthOptions(MoodleUser $user): array
    {
        $authOptions = [];

        if($user->password_hash !== null) {
            $authOptions[] = AuthOptions::PASSWORD->value;
        }

        if($user->notify_method) {
            if($user->notify_method === "get_update") {
                $authOptions[] = AuthOptions::CODE_CUSTOM->value;
            }

            if($user->notify_method === "webhook" && $user->webhook) {
                $authOptions[] = AuthOptions::CODE_CUSTOM->value;
            }
        }

        return $authOptions;
    }

    public function register(array $data): MoodleUser
    {
        if($this->databaseUserRepository->findByIdentifiers(
            token: $data["token"] ?? null,
            nameAlias: $data[static::IDENTIFIER_ALIAS] ?? null
        )) {
            throw new \Exception("Already have user with given token.", StatusCodeInterface::STATUS_CONFLICT);
        }

        try {
            $baseMoodleUser = $this->apiUserRepository->getUserInfo($data["token"]);
        } catch (\Throwable $th) {
            throw new \Exception("Given token is invalid or Moodle webservice is down.", StatusCodeInterface::STATUS_BAD_REQUEST);
        }

        $rpc = RPC::create(Config::get("rpc.connection"));
        $factory = new Factory($rpc);
        $storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
        $this->connection->beginTransaction();
        try {
            $user = MoodleUser::createFromBaseMoodleUser(
                $baseMoodleUser,
                isset($data["password"]) ? MoodleUser::hashPassword($data["password"]) : null,
                $data[static::IDENTIFIER_ALIAS] ?? null,
            );
            $storage->set($user->moodle_token, $user);

            $queue = $this->jobsFactory->createQueue(JobsEnum::PARSE_COURSES->value);
            $queue->dispatch(
                $queue->create(
                    name: Task::class,
                    payload: (new Payload(JobsEnum::PARSE_COURSES->value, $user))
                        ->add(new Payload(JobsEnum::PARSE_GRADES->value, $user))
                        ->add(new Payload(JobsEnum::PARSE_EVENTS->value, $user))
                        ->add(new Payload(JobsEnum::PARSE_ASSIGNMENTS->value, $user))
                        ->add(new Payload(JobsEnum::SET_INITIALIZED->value, $user))
                )
            );
        } catch (\Throwable $th) {
            if(isset($user)) {
                $storage->delete($user->moodle_token);
            }
            $this->connection->rollBack();
            throw $th;
        }

        $this->connection->commit();
        return $user;
    }

    public function getAuthOptions(array $data): array
    {
        $user = $this->databaseUserRepository->findByIdentifiers(
            nameAlias: $data['identifier'] ?? null,
            username: $data['identifier'] ?? null
        );

        if($user === null) {
            throw new \Exception("No user with given identifier", StatusCodeInterface::STATUS_NOT_FOUND);
        }

        return $this->getUserAuthOptions($user);
    }

    public function authPassword(array $data): ?MoodleUser
    {
        $user = $this->databaseUserRepository->findByIdentifiers(
            nameAlias: $data['identifier'] ?? null,
            username: $data['identifier'] ?? null
        );

        if($user === null) {
            throw new \Exception("No user with given identifier", StatusCodeInterface::STATUS_BAD_REQUEST);
        }

        if(!$user->verifyPassword($data["password"])) {
            return null;
        }

        return $user;
    }

}
