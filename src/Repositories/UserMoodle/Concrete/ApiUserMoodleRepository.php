<?php 

namespace App\Repositories\UserMoodle\Concrete;

use App\Modules\Moodle\BaseMoodleUser;
use App\Modules\Moodle\Moodle;
use App\Repositories\UserMoodle\ApiUserMoodleRepositoryInterface;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Eloquent\Collection;

class ApiUserMoodleRepository implements ApiUserMoodleRepositoryInterface
{
    protected $store = true;

    public function enableDatabaseCache(): void
    {
        $this->store = true;
    }

    public function disableDatabaseCache(): void
    {
        $this->store = false;
    }

    public function getActiveCourses(int $moodleId, string $moodleToken): Collection
    {
        $moodle = Moodle::createFromToken($moodleToken, $moodleId);
        $userCourses = $moodle->getUserCourses();
        
        /**
         * TODO: Complete DatabaseUserMoodleRepositoryInterface, add storing methods to it, inject DatabaseUserMoodleRepositoryInterface realisation in constuctor and store
         */
        $upsertCourseAssigns = [];
        foreach($userCourses as $userCourse){
            $upsertCourseAssigns[] = [
                "course_id" => $userCourse["course_id"],
                "moodle_id" => $moodleId
            ];
        }
        Manager::connection()->table("courses")->upsert($userCourses, "course_id");
        Manager::connection()->table("user_course_assign")->upsert($upsertCourseAssigns, ["course_id", "moodle_id"]);
        ///

        return new Collection($userCourses);
    }

    public function getCourseGrades(int $moodleId, string $moodleToken, int $courseId): Collection
    {
        $moodle = Moodle::createFromToken($moodleToken, $moodleId);
        $courseGrades = $moodle->getCourseGrades($courseId);

        /**
         * TODO: Complete DatabaseUserMoodleRepositoryInterface, add storing methods to it, inject DatabaseUserMoodleRepositoryInterface realisation in constuctor and store
         */
        $courseModulesUpsertArray = [];
        $courseGradesUpsertArray = [];

        foreach($courseGrades as $courseGrade){
            $courseModulesUpsertArray[] = [
                "cmid" => $courseGrade["cmid"],
                "course_id" => (int)$courseGrade["course_id"],
            ];
            $courseGradesUpsertArray[] = [
                "grade_id" => $courseGrade["id"],
                "moodle_id" => $moodleId,
                "cmid" => $courseGrade["cmid"],
                "course_id" => $courseGrade["course_id"],
                "name" => $courseGrade["name"],
                "percentage" => $courseGrade["percentage"],
            ];
        }

        try {
            Manager::connection()->beginTransaction();
            Manager::connection()->table("course_modules")->upsert($courseModulesUpsertArray, "cmid");
            Manager::connection()->table("grades")->upsert($courseGradesUpsertArray, ["cmid", "moodle_id"]);
            Manager::connection()->commit();
        } catch (\Throwable $th) {
            Manager::connection()->rollBack();
        }

        ///

        Manager::connection()->table("courses");

        return new Collection($courseGrades);
    }

    public function getUserInfo(string $moodleToken): ?BaseMoodleUser
    {
        return Moodle::createFromToken($moodleToken)->getUser();
    }
}