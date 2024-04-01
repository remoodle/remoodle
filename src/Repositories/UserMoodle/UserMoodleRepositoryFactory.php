<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle;

use App\Repositories\UserMoodle\Concrete\ApiUserMoodleRepository;
use App\Repositories\UserMoodle\Concrete\DatabaseUserMoodleRepository;

class UserMoodleRepositoryFactory
{
    public function create(bool $offline = false): UserMoodleRepositoryInterface
    {
        if($offline) {
            return new DatabaseUserMoodleRepository();
        }

        return new ApiUserMoodleRepository();
    }
}
