<?php

namespace App\Modules\Moodle;

use App\Modules\Moodle\Entities\Course;
use App\Modules\Moodle\Entities\Event;
use App\Modules\Moodle\Entities\Grade;
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
    ) {
    }

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

    /**
     * @param \App\Modules\Moodle\Enums\CourseEnrolledClassification $classification
     * @return \App\Modules\Moodle\Entities\Course[]
     */
    public function getUserCourses(CourseEnrolledClassification $classification = CourseEnrolledClassification::INPROGRESS): array
    {
        $coursesRaw = $this->moodleWrapper->getEnrolledCoursesByTimelineClassification($classification->value)["courses"];
        $courses = [];

        foreach($coursesRaw as $course) {
            $courses[] = new Course(
                course_id: (int)$course["id"],
                url: $course["viewurl"],
                coursecategory: $course["coursecategory"],
                name: $course["fullname"] ?? $course["shortname"],
                end_date: $course["startdate"],
                start_date: $course["enddate"],
            );
        }

        return $courses;
    }

    /**
     * Receives user's grades for course from moodle api
     * @param int $courseId
     * @return \App\Modules\Moodle\Entities\Grade[]
     */
    public function getCourseGrades(int $courseId): array
    {
        $rawGrades = $this->moodleWrapper->getCourseGrades($courseId);
        $grades = [];

        foreach($rawGrades["usergrades"][0]['gradeitems'] as $gradeitem) {
            if(($gradeitem["gradeformatted"] != "-" or $gradeitem["percentageformatted"] != "-") && array_key_exists("cmid", $gradeitem)) {
                $grades[] = new Grade(
                    grade_id: $gradeitem['id'],
                    cmid: $gradeitem['cmid'],
                    name: $gradeitem['itemname'],
                    percentage: (int)$gradeitem['percentageformatted'],
                    moodle_id: $this->moodleWrapper->getUserId(),
                    course_id: $courseId
                    // feedback: $gradeitem["feedback"],
                );
            }
        }

        return $grades;
    }

    /**
     * Receives deadline from moodle api
     * @param null|int $from - time start
     * @param null|int $to - time due
     * @return \App\Modules\Moodle\Entities\Event[]
     */
    public function getDeadlines(?int $from = null, ?int $to = null): array
    {
        $from = $from ?? time();
        $to ??= time() + (3600 * 24 * 7);

        $deadlines = $this->moodleWrapper->getCalendarActionByTimesort($from, $to);
        $events = [];

        foreach($deadlines["events"] as $event) {
            $events[] = new Event(
                event_id: $event['id'],
                name: $event['name'],
                instance: $event['instance'],
                timestart: $event['timestart'],
                visible: (bool)$event['visible'],
                course_name: $event["course"]["shortname"] ?? $event["course"]["fullname"],
                course_id: $event['course']['id']
            );
        }

        return $events;
    }
}
