<?php 

namespace App\Repositories\UserMoodle\Concrete;

use App\Models\Course;
use App\Models\Grade;
use App\Models\MoodleUser;
use App\Modules\Moodle\BaseMoodleUser;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Illuminate\Contracts\Database\Eloquent\Builder;
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
        if(!($token || $moodleId || $barcode || $email || $nameAlias)){
            return null;
        }

        $query = MoodleUser::query();

        if($token){
            $query->where("moodle_token", $token);
        }

        if($moodleId){
            $query->where("moodle_id", $moodleId);
        }

        if($barcode){
            $query->where("barcode", $barcode);
        }

        if($email){
            $query->where("email", $email);
        }

        if($nameAlias){
            $query->where("name_alias", $nameAlias);
        }

        return $query->first();
    }

}