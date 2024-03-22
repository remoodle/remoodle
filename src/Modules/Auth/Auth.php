<?php 

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
    ){}

    const IDENTIFIER_BARCODE = "barcode";
    const IDENTIFIER_ALIAS = "name_alias";
    const IDENTIFIER_EMAIL = "email";

    private function getUserAuthOptions(MoodleUser $user): array
    {
        $authOptions = [];

        if($user->email && $user->email_verified_at){
            $authOptions[] = AuthOptions::CODE_EMAIL->value;
        }

        if($user->password_hash !== null){
            $authOptions[] = AuthOptions::PASSWORD->value;
        }

        if($user->notify_method && $user->notify_method !== 'email'){
            if($user->notify_method === "get_update"){
                $authOptions[] = AuthOptions::CODE_CUSTOM->value;
            }

            if($user->notify_method === "webhook" && $user->webhook){
                $authOptions[] = AuthOptions::CODE_CUSTOM->value;
            }
        }

        return $authOptions;
    }

    public function register(array $data): MoodleUser
    {        
        if($this->databaseUserRepository->findByIdentifiers(
            token: $data["token"] ?? null,
            email: $data[static::IDENTIFIER_EMAIL] ?? null,
            nameAlias: $data[static::IDENTIFIER_ALIAS] ?? null
        )){
            throw new \Exception("Already have user with given token.", StatusCodeInterface::STATUS_CONFLICT);
        }

        try {
            $baseMoodleUser = $this->apiUserRepository->getUserInfo($data["token"]);
        } catch (\Throwable $th) {
            throw new \Exception("Given token is invalid or Moodle webservice is down.", StatusCodeInterface::STATUS_BAD_REQUEST);
        }

        $this->connection->beginTransaction();
        try {
            $user = MoodleUser::createFromBaseMoodleUser(
                $baseMoodleUser, 
                isset($data["password"]) ? MoodleUser::hashPassword($data["password"]) : null,
                $data[static::IDENTIFIER_ALIAS] ?? null,
                $data[static::IDENTIFIER_EMAIL] ?? null,
            );
    
            if(array_key_exists(static::IDENTIFIER_EMAIL, $data)){
                $verifyCode = VerifyCode::create([
                    'moodle_id' => $user->moodle_id,
                    'code' => random_int(100000,999999), 
                    'type' => 'email_verify', //TODO: enums 
                    'expires_at' => Carbon::now()->addHours(6)
                ]);
    
                $message = new Message($user->moodle_id, "Ваш код подтверждения: " . $verifyCode->code, time(), null, true); 
                $this->notificationBridge->notify($message, $user);
            }
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }

        $rpc = RPC::create(Config::get("rpc.connection"));
        $factory = new Factory($rpc);        
        $storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
        $storage->set($user->moodle_token, $user);
        
        $queue = $this->jobsFactory->createQueue(JobsEnum::PARSE_TOTAL->value);
        $queue->dispatch($queue->create(Task::class, $user->toJson()));

        $this->connection->commit();
        return $user;
    }

    public function getAuthOptions(array $data): array 
    {       
        $user = $this->databaseUserRepository->findByIdentifiers(
            email: $data['identifier'] ?? null,
            nameAlias: $data['identifier'] ?? null,
            barcode: $data['identifier'] ?? null
        );

        if($user === null){
            throw new \Exception("No user with given identifier", StatusCodeInterface::STATUS_NOT_FOUND);
        }

        return $this->getUserAuthOptions($user);
    }

    public function authPassword(array $data): ?MoodleUser
    {
        $user = $this->databaseUserRepository->findByIdentifiers(
            email: $data['identifier'] ?? null,
            nameAlias: $data['identifier'] ?? null,
            barcode: $data['identifier'] ?? null
        );

        if($user === null){
            throw new \Exception("No user with given identifier", StatusCodeInterface::STATUS_BAD_REQUEST);
        }

        if(!$user->verifyPassword($data["password"])){
            return null;
        }

        return $user;
    }

}