<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle;

use App\Models\MoodleUser;
use App\Modules\Moodle\Entities\Assignment;
use App\Modules\Moodle\Entities\Event;
use App\Modules\Moodle\Entities\Grade;
use App\Repositories\UserMoodle\UserMoodleRepositoryInterface;

interface DatabaseUserMoodleRepositoryInterface extends UserMoodleRepositoryInterface
{
    public function findByIdentifiers(
        ?string $token = null,
        ?int $moodleId = null,
        ?string $username = null,
        ?string $nameAlias = null
    ): ?MoodleUser;

    public function getAssignmentByCmid(int $moodleId, string $moodleToken, int $cmid): Assignment;
    public function getGradeByCmid(int $moodleId, string $moodleToken, int $cmid): Grade;
    public function getEventByInstance(int $moodleId, string $moodleToken, int $instance): Event;
    public function isUserAssignedToCourse(int $moodleId, int $courseId): bool;
}
