<?php

declare(strict_types=1);

namespace Queue\Actions;

use App\Models\MoodleUser;
use App\Models\UserCourseAssign;
use App\Modules\Moodle\Entities\Course;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use App\Modules\Moodle\Moodle;
use App\Modules\Search\SearchEngineInterface;
use Illuminate\Database\Connection;

class ParseUserCourses
{
    public function __construct(
        private readonly Connection $connection,
        private readonly SearchEngineInterface $searchEngine,
        private readonly MoodleUser $user
    ) {
    }

    public function __invoke(): void
    {
        $moodle = Moodle::createFromToken($this->user->moodle_token, $this->user->moodle_id);
        [$courses, $coursesAssign] = $this->getUserCoursesAndAssigns($this->user->moodle_id, $moodle);

        $this->connection->beginTransaction();

        try {
            UserCourseAssign::query()->where("moodle_id", $this->user->moodle_id)->update([
                "classification" => CourseEnrolledClassification::PAST->value
            ]);
            $this->connection
                ->table("courses")
                ->upsert(array_map(fn (Course $course) => (array)$course, $courses), "course_id");

            $this->connection
                ->table("user_course_assign")
                ->upsert($coursesAssign, [ "course_id", "moodle_id"], ["classification"]);
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }

        // $this->searchEngine->putMany($courses);
    }

    /**
     * @param int $moodleId
     * @param \App\Modules\Moodle\Moodle $moodle
     * @return array{Course[], array}
     */
    private function getUserCoursesAndAssigns(int $moodleId, Moodle $moodle): array
    {
        $courses = $moodle->getUserCourses();
        $courseAssign = array_map(function (Course $course) use ($moodleId) {
            return [
                "course_id" => $course->course_id,
                "moodle_id" => $moodleId,
                "classification" => $course->status->value
            ];
        }, $courses);

        return [$courses, $courseAssign];
    }
}
