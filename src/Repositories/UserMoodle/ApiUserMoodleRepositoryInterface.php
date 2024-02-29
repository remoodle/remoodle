<?php 

namespace App\Repositories\UserMoodle;

use App\Repositories\UserMoodle\UserMoodleRepositoryInterface;

interface ApiUserMoodleRepositoryInterface extends UserMoodleRepositoryInterface
{
    public function enableDatabaseCache(): void;
    public function disableDatabaseCache(): void;
}