<?php 

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Models\UserCourseAssign;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Connection;

class ParseUserCourses extends BaseHandler
{
    private Moodle $moodle;
    private Connection $connection;

    public function handle(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = new MoodleUser(json_decode($this->receivedTask->getPayload(), 1));

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
                ->upsert($coursesAssign, 
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

        $this->receivedTask->complete();
    }

    private function getUserCoursesAndAssigns(int $moodleId): array
    {
        $courses = $this->getUserActiveCourses();
        $courseAssign = array_map(function($course) use ($moodleId){
            return [
                "course_id" => $course["course_id"],
                "moodle_id" => $moodleId,
                "classification" => CourseEnrolledClassification::INPROGRESS->value
            ];
        }, $courses);

        return [$courses, $courseAssign];
    }

    private function getUserActiveCourses(): array
    {
        return $this->moodle->getUserCourses();
    }

}