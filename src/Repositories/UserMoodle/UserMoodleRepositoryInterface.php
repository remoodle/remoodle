<?php 

namespace App\Repositories\UserMoodle;

use App\Modules\Moodle\BaseMoodleUser;
use Illuminate\Database\Eloquent\Collection;

interface UserMoodleRepositoryInterface
{
    public function getActiveCourses(int $moodleId, string $moodleToken): Collection;
    public function getCourseGrades(int $moodleId, string $moodleToken, int $courseId): Collection;
    public function getUserInfo(string $moodleToken): ?BaseMoodleUser;
}