<?php

declare(strict_types=1);

namespace App\GRPC\Auth;

use Spiral\RoadRunner\KeyValue\StorageInterface;

class Auth
{
    public function __construct(
        private StorageInterface $storage,
    ) {
    }

    public function tokenIsValid(string $token): array
    {
        $user = $this->storage->get($token);

        if(!$user) {
            return [false, null];
        }

        return [true, $user];
    }
}
