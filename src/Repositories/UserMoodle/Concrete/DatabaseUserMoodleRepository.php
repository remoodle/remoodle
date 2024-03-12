<?php 

namespace App\Repositories\UserMoodle\Concrete;

use App\Models\Course;
use App\Models\Grade;
use App\Models\MoodleUser;
use App\Modules\Moodle\BaseMoodleUser;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class DatabaseUserMoodleRepository implements DatabaseUserMoodleRepositoryInterface
{
    public function getActiveCourses(int $moodleId, string $moodleToken): Collection
    {
        return new Collection(MoodleUser::query()
            ->with(["courses" => function($query){
                $query->orderBy("course_id", "desc");
            }])
            ->where("moodle_id", $moodleId)
            ->first()
            ->courses
            ->toArray()
        );
    }

    public function getCoursesGrades(int $moodleId, string $moodleToken): Collection
    {
        return new Collection(MoodleUser::query()
            ->with(["grades"])
            ->where("moodle_id", $moodleId)
            ->first()
            ->grades
            ->toArray()
        );    
    }

    public function getCourseGrades(int $moodleId, string $moodleToken, int $courseId): Collection
    {
        return new Collection(Grade::where("moodle_id", $moodleId)->where("course_id", $courseId)->get());
    }

    public function getUserInfo(string $moodleToken): ?BaseMoodleUser
    {
        $moodleUser = MoodleUser::findByToken($moodleToken);
        return $moodleUser ? new BaseMoodleUser($moodleToken, $moodleUser->barcode, $moodleUser->name, $moodleUser->moodle_id) : null;
    }

    public function findByEmail(string $email): ?MoodleUser
    {
        return MoodleUser::where("email", $email)->where("email_verified_at", "!=", null)->first();
    }

    public function findByIdentifiers(
        ?string $token = null, 
        ?int $moodleId = null, 
        ?string $barcode = null, 
        ?string $email = null, 
        ?string $nameAlias = null
    ): ?MoodleUser{
        if (!($token || $moodleId || $barcode || $email || $nameAlias)) {
            return null;
        }
    
        $query = MoodleUser::query();
    
        $query->where(function ($q) use ($token, $moodleId, $barcode, $email, $nameAlias) {
            if ($token) {
                $q->orWhere("moodle_token", $token);
            }
            if ($moodleId) {
                $q->orWhere("moodle_id", $moodleId);
            }
            if ($barcode) {
                $q->orWhere("barcode", $barcode);
            }
            if ($email) {
                $q->orWhere("email", $email)->where("email_verified_at", "!=", null);
            }
            if ($nameAlias) {
                $q->orWhere("name_alias", $nameAlias);
            }
        });
    
        return $query->first();
    }

    public function getDeadlines(int $moodleId, string $moodleToken): Collection
    {
        return new Collection(MoodleUser::query()
            ->with(["events" => function($query){
                $query->where("timestart", ">", time());
            }])
            ->where("moodle_id", $moodleId)
            ->first()
            ->grades
            ->toArray()
        );    
    }    

}