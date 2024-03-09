<?php 

namespace App\Repositories\UserMoodle;

use App\Models\MoodleUser;
use App\Repositories\UserMoodle\UserMoodleRepositoryInterface;

interface DatabaseUserMoodleRepositoryInterface extends UserMoodleRepositoryInterface
{
    public function findByEmail(string $email): ?MoodleUser;

    public function findByIdentifiers(
        ?string $token = null, 
        ?int $moodleId = null, 
        ?string $barcode = null, 
        ?string $email = null, 
        ?string $nameAlias = null
    ): ?MoodleUser;
}