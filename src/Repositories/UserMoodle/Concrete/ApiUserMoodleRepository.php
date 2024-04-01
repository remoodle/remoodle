<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle\Concrete;

use App\Modules\Moodle\BaseMoodleUser;
use App\Modules\Moodle\Moodle;
use App\Repositories\UserMoodle\ApiUserMoodleRepositoryInterface;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Eloquent\Collection;

class ApiUserMoodleRepository implements ApiUserMoodleRepositoryInterface
{
    public function getActiveCourses(int $moodleId, string $moodleToken): Collection
    {
        return new Collection(Moodle::createFromToken($moodleToken, $moodleId)->getUserCourses());
    }

    public function getCourseGrades(int $moodleId, string $moodleToken, int $courseId): Collection
    {
        return new Collection(Moodle::createFromToken($moodleToken, $moodleId)->getCourseGrades($courseId));
    }

    public function getUserInfo(string $moodleToken): ?BaseMoodleUser
    {
        return Moodle::createFromToken($moodleToken)->getUser();
    }

    public function getDeadlines(int $moodleId, string $moodleToken): Collection
    {
        return new Collection(Moodle::createFromToken($moodleToken, $moodleId)->getDeadlines());
    }
}
