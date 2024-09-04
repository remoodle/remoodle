<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Models\UserCourseAssign;
use App\Modules\Jobs\FactoryInterface;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Connection;
use App\Modules\Moodle\Entities\Course;
use App\Modules\Search\SearchEngineInterface;

class ParseUserCourses extends BaseHandler
{
    private Connection $connection;
    private SearchEngineInterface $searchEngine;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
        $this->searchEngine = $this->get(SearchEngineInterface::class);
    }

    protected function dispatch(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = $this->getPayload()->payload();
        $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);

        [$courses, $coursesAssign] = $this->getUserCoursesAndAssigns($user->moodle_id, $moodle);

        $this->connection->beginTransaction();

        try {
            UserCourseAssign::where("moodle_id", $user->moodle_id)->update([
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

        $this->searchEngine->putMany($courses);
    }

    /**
     * @param int $moodleId
     * @param \App\Modules\Moodle\Moodle $moodle
     * @return array{Course[], array}
     */
    private function getUserCoursesAndAssigns(int $moodleId, Moodle $moodle): array
    {
        $inprogressCourses = $moodle->getUserCourses(CourseEnrolledClassification::INPROGRESS);
        $pastCourses = $moodle->getUserCourses(CourseEnrolledClassification::PAST);
        $futureCourses = $moodle->getUserCourses(CourseEnrolledClassification::FUTURE);
        $courses = array_merge($inprogressCourses, $pastCourses, $futureCourses);

        $courseAssign = array_map(function (Course $course) use ($moodleId) {
            return [
                "course_id" => $course->course_id,
                "moodle_id" => $moodleId,
                "classification" => $course->status === 1 ? CourseEnrolledClassification::INPROGRESS->value : CourseEnrolledClassification::PAST->value
            ];
        }, $courses);

        return [$courses, $courseAssign];
    }
}
