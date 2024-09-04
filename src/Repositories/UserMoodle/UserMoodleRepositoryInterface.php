<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle;

use App\Modules\Moodle\BaseMoodleUser;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use Illuminate\Database\Eloquent\Collection;

interface UserMoodleRepositoryInterface
{
    /**
     * @param int $moodleId
     * @param string $moodleToken
     * @param ?CourseEnrolledClassification $status
     * @return \App\Modules\Moodle\Entities\Course[]
     */
    public function getActiveCourses(int $moodleId, string $moodleToken, ?CourseEnrolledClassification $status = null): array;

    /**
     * @param int $moodleId
     * @param string $moodleToken
     * @param int $courseId
     * @return \App\Modules\Moodle\Entities\Grade[]
     */
    public function getCourseGrades(int $moodleId, string $moodleToken, int $courseId): array;

    /**
     * @param string $moodleToken
     * @return null|BaseMoodleUser
     */
    public function getUserInfo(string $moodleToken): ?BaseMoodleUser;

    /**
     * @param int $moodleId
     * @param string $moodleToken
     * @return \App\Modules\Moodle\Entities\Event[]
     */
    public function getDeadlines(int $moodleId, string $moodleToken): array;

    /**
     * @param int $moodleId
     * @param string $moodleToken
     * @param int $courseId
     * @return \App\Modules\Moodle\Entities\Assignment[]
     */
    public function getCourseAssigments(int $moodleId, string $moodleToken, int $courseId): array;

    /**
     * @param int $moodleId
     * @param string $moodleToken
     * @param int $courseId
     * @return \App\Modules\Moodle\Entities\CourseContent[]
     */
    public function getCourseContents(int $moodleId, string $moodleToken, int $courseId): array;

}
