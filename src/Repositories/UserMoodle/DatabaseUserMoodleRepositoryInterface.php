<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle;

use App\Models\MoodleUser;
use App\Repositories\UserMoodle\UserMoodleRepositoryInterface;

interface DatabaseUserMoodleRepositoryInterface extends UserMoodleRepositoryInterface
{
    public function findByIdentifiers(
        ?string $token = null,
        ?int $moodleId = null,
        ?string $barcode = null,
        ?string $nameAlias = null
    ): ?MoodleUser;
}
