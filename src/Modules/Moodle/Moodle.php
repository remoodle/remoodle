<?php

namespace App\Modules\Moodle;

use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use Core\Config;
use Fugikzl\MoodleWrapper\Moodle as MoodleWrapperMoodle;

final class Moodle
{
    public static function constructMoodleWrapper(string $token, ?int $moodleUserId = null)
    {
        return new MoodleWrapperMoodle(Config::get("moodle.webservice_url"), $token, $moodleUserId);
    }

    public static function createFromToken(string $token, ?int $moodleId = null)
    {
        return new static(static::constructMoodleWrapper($token, $moodleId), $token);
    }
    
    public static function getBarcodeFromUsername(string $username)
    {
        return explode("@", $username)[0];
    }

    public function __construct(
        private MoodleWrapperMoodle $moodleWrapper,
        private string $token
    ){}

    /**
     * @return BaseMoodleUser
     */
    public function getUser(): BaseMoodleUser
    {
        $res = $this->moodleWrapper->getUserInfo();

        return new BaseMoodleUser(
            $this->token,
            static::getBarcodeFromUsername($res["username"]),
            $res["fullname"],
            $res["userid"]
        );
    }
    
    public function getWrapper(): MoodleWrapperMoodle
    {
        return $this->moodleWrapper;
    }

    public function setMoodleId(int $moodleId)
    {
        $this->moodleWrapper->setUserId($moodleId);
    }

    public function getUserCourses(CourseEnrolledClassification $classification = CourseEnrolledClassification::INPROGRESS): array
    {
        $coursesRaw = $this->moodleWrapper->getEnrolledCoursesByTimelineClassification($classification->value)["courses"];
        
        return array_map(function(array $course){
            return [
                "course_id" => (int)$course["id"],
                "url" => $course["viewurl"],
                "coursecategory" => $course["coursecategory"],
                "name" => $course["fullname"] ?? $course["shortname"],
                "start_date" => $course["startdate"],
                "end_date" => $course["enddate"],
            ];
        }, $coursesRaw);
    }

    public function getCourseGrades(int $courseId): array
    {   
        $rawGrades = $this->moodleWrapper->getCourseGrades($courseId);
        $grades = [];
        
        foreach($rawGrades["usergrades"][0]['gradeitems'] as $gradeitem)
        {
            if(($gradeitem["gradeformatted"] != "-" or $gradeitem["percentageformatted"] != "-") && array_key_exists("cmid",$gradeitem))
            {
                $grades[] = [
                    "id" => $gradeitem["id"],
                    "name" => $gradeitem["itemname"],
                    "percentage" => (int)$gradeitem["percentageformatted"],
                    "feedback" => $gradeitem["feedback"],
                    "iteminstance" => $gradeitem["iteminstance"],
                    "cmid" => $gradeitem["cmid"] ,
                    "course_id" => $courseId
                ];
            }
        }

        return $grades;
    }

    public function getDeadlines(?int $from = null, ?int $to = null): array
    {   
        $from = $from ?? time();
        $to ??= time() + (3600 * 24 * 7);

        $deadlines = $this->moodleWrapper->getCalendarActionByTimesort($from, $to);
        
        return array_map(function($event){
            return [
                "event_id" => $event["id"],
                "name" => $event["name"],
                "instance" => $event["instance"],
                "timestart" => $event["timestart"],
                "visible" => $event["visible"],
                "course_name" => $event["course"]["shortname"] ?? $event["course"]["fullname"],
                "course_id" => $event["course"]["id"]
            ];
        }, $deadlines["events"]);
    }
}