<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle\Concrete;

use App\Modules\Moodle\BaseMoodleUser;
use App\Modules\Moodle\Moodle;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use App\Repositories\UserMoodle\ApiUserMoodleRepositoryInterface;

class ApiUserMoodleRepository implements ApiUserMoodleRepositoryInterface
{
    /**
     * @inheritDoc
     */
    public function getCourses(int $moodleId, string $moodleToken, ?CourseEnrolledClassification $status = null): array
    {
        return Moodle::createFromToken($moodleToken, $moodleId)->getUserCourses($status);
    }

    /**
     * @inheritDoc
     */
    public function getCourseGrades(int $moodleId, string $moodleToken, int $courseId): array
    {
        return Moodle::createFromToken($moodleToken, $moodleId)->getCourseGrades($courseId);
    }

    /**
     * @inheritDoc
     */
    public function getUserInfo(string $moodleToken): ?BaseMoodleUser
    {
        return Moodle::createFromToken($moodleToken)->getUser();
    }

    /**
     * @inheritDoc
     */
    public function getDeadlines(int $moodleId, string $moodleToken): array
    {
        return Moodle::createFromToken($moodleToken, $moodleId)->getDeadlines(from: time());
    }

    /**
     * @inheritDoc
     */
    public function getCourseAssigments(int $moodleId, string $moodleToken, int $courseId): array
    {
        return Moodle::createFromToken($moodleToken, $moodleId)->getCourseAssignments($courseId);
    }

    /**
     * @inheritDoc
     */
    public function getCourseContents(int $moodleId, string $moodleToken, int $courseId): array
    {
        return Moodle::createFromToken($moodleToken, $moodleId)->getCourseContent($courseId);
    }
}
