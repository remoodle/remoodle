<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle;

use App\Repositories\UserMoodle\Concrete\ApiUserMoodleRepository;
use App\Repositories\UserMoodle\Concrete\DatabaseUserMoodleRepository;

enum RepositoryTypes: string
{
    case DATABASE = DatabaseUserMoodleRepository::class;
    case MOODLE_API = ApiUserMoodleRepository::class;
}
