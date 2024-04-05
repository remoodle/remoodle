<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Models\UserCourseAssign;
use App\Modules\Jobs\FactoryInterface;
use App\Modules\Jobs\JobsEnum;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Connection;
use Spiral\RoadRunner\Jobs\Task\Task;
use App\Modules\Moodle\Entities\Course;

class ParseUserCourses extends BaseHandler
{
    private Connection $connection;
    private FactoryInterface $queueFactory;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
        $this->queueFactory = $this->get(FactoryInterface::class);
    }

    public function handle(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = new MoodleUser(json_decode($this->receivedTask->getPayload(), true));
        $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);

        [$courses, $coursesAssign] = $this->getUserCoursesAndAssigns($user->moodle_id, $moodle);

        $this->connection->beginTransaction();

        try {
            UserCourseAssign::where("moodle_id", $user->moodle_id)->update([
                "classification" => CourseEnrolledClassification::PAST->value
            ]);
            $this->connection
                ->table("courses")
                ->upsert($courses, "course_id");

            $this->connection
                ->table("user_course_assign")
                ->upsert($coursesAssign, [ "course_id", "moodle_id"], ["classification"]);

            //BEGIN GOVNO
            $queue = $this->queueFactory->createQueue(JobsEnum::PARSE_GRADES->value);
            $task = $queue->create(Task::class, $user->toJson());
            $queue->dispatch($task);
            //GOVNO ENDS

            $this->connection->commit();
            $this->receivedTask->complete();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            $this->receivedTask->fail($th);
            throw $th;
        }
    }

    /**
     * @param int $moodleId
     * @param \App\Modules\Moodle\Moodle $moodle
     * @return array<int, array>
     */
    private function getUserCoursesAndAssigns(int $moodleId, Moodle $moodle): array
    {
        $courses = $moodle->getUserCourses();
        $courseAssign = array_map(function (Course $course) use ($moodleId) {
            return [
                "course_id" => $course->course_id,
                "moodle_id" => $moodleId,
                "classification" => CourseEnrolledClassification::INPROGRESS->value
            ];
        }, $courses);

        return [array_map(fn (Course $course) => (array)$course, $courses), $courseAssign];
    }
}
