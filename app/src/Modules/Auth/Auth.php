<?php 

namespace App\Modules\Auth;

use App\Models\MoodleUser;
use App\Modules\Auth\Enums\AuthOptions;
use App\Repositories\UserMoodle\ApiUserMoodleRepositoryInterface;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Fig\Http\Message\StatusCodeInterface;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\Task\Task;

class Auth
{
    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $databaseUserRepository,
        private ApiUserMoodleRepositoryInterface $apiUserRepository,
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

        
        return  MoodleUser::createFromBaseMoodleUser(
            $baseMoodleUser, 
            isset($data["password"]) ? MoodleUser::hashPassword($data["password"]) : null,
            $data[static::IDENTIFIER_ALIAS] ?? null,
            $data[static::IDENTIFIER_EMAIL] ?? null,
        );
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

    public function authPassword(array $data): ?string
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

        return $user->moodle_token;
    }

}