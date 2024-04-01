<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Models\UserCourseAssign;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use App\Modules\Moodle\Moodle;
use Core\Config;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Connection;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\Task\Task;
use App\Modules\Moodle\Entities\Course as Course;

class ParseUserCourses extends BaseHandler
{
    private Moodle $moodle;
    private Connection $connection;

    public function handle(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = new MoodleUser(json_decode($this->receivedTask->getPayload(), true));

        $this->moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);
        $this->connection = Manager::connection();

        [$courses, $coursesAssign] = $this->getUserCoursesAndAssigns($user->moodle_id);

        try {
            $this->connection->beginTransaction();
            UserCourseAssign::where("moodle_id", $user->moodle_id)->update([
                "classification" => CourseEnrolledClassification::PAST->value
            ]);
            $this->connection
                ->table("courses")
                ->upsert($courses, "course_id");
            $this->connection
                ->table("user_course_assign")
                ->upsert(
                    $coursesAssign,
                    [
                        "course_id",
                        "moodle_id"
                    ],
                    [
                        "classification"
                    ]
                );
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            $this->receivedTask->fail($th);
            throw $th;
        }

        $jobs = new Jobs(RPC::create(Config::get("rpc.connection")));
        $queue = $jobs->connect('user_parse_grades');
        $task = $queue->create(Task::class, $user->toJson());
        $queue->dispatch($task);

        $this->receivedTask->complete();
    }

    private function getUserCoursesAndAssigns(int $moodleId): array
    {
        $courses = $this->getUserActiveCourses();
        $courseAssign = array_map(function (Course $course) use ($moodleId) {
            return [
                "course_id" => $course->course_id,
                "moodle_id" => $moodleId,
                "classification" => CourseEnrolledClassification::INPROGRESS->value
            ];
        }, $courses);

        return [array_map(fn (Course $course) => (array)$course, $courses), $courseAssign];
    }

    /**
     * @return \App\Modules\Moodle\Entities\Course[]
     */
    private function getUserActiveCourses(): array
    {
        return $this->moodle->getUserCourses();
    }

}
