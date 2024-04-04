<?php

declare(strict_types=1);

namespace App\Modules\Moodle;

use App\Modules\Moodle\Entities\Assignment;
use App\Modules\Moodle\Entities\Course;
use App\Modules\Moodle\Entities\Event;
use App\Modules\Moodle\Entities\Grade;
use App\Modules\Moodle\Entities\IntroAttachment;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use Core\Config;
use Fugikzl\MoodleWrapper\Moodle as MoodleWrapperMoodle;
use GuzzleHttp\Client;

final class Moodle
{
    public static function constructMoodleWrapper(string $token, ?int $moodleUserId = null): MoodleWrapperMoodle
    {
        return new MoodleWrapperMoodle(Config::get("moodle.webservice_url"), $token, $moodleUserId);
    }

    public static function createFromToken(string $token, ?int $moodleId = null): static
    {
        return new static(static::constructMoodleWrapper($token, $moodleId), $token);
    }

    public static function generateToken(string $username, string $password): string
    {
        $client = new Client(['verify' => false]);

        $res = json_decode($client->get(Config::get("moodle.generate_token_url"), [
            'query' => [
                'username' => $username,
                'password' => $password,
                'service' => 'moodle_mobile_app'
            ]
        ])->getBody()->getContents(), true);

        if(array_key_exists('error', $res)) {
            throw new \Exception($res['error'], 400);
        }

        return $res['token'];
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
            token: $this->token,
            username: $res["username"],
            name: $res["fullname"],
            moodleId: $res["userid"]
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
            $gradeitem['percentageformatted'] = str_replace([' ', '%'], '', $gradeitem['percentageformatted']);
            $grade = is_numeric($gradeitem['percentageformatted'])
                ? (int) $gradeitem['percentageformatted']
                : null;

            $grades[] = new Grade(
                grade_id: $gradeitem['id'],
                cmid: $gradeitem['cmid'] ?? null,
                name: $gradeitem['itemname'] ?? "",
                percentage: $grade,
                moodle_id: $this->moodleWrapper->getUserId(),
                course_id: $courseId,
                itemtype: $gradeitem['itemtype']
            );
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

    /**
     * @param int $courseId
     * @return \App\Modules\Moodle\Entities\Assignment[]
     */
    public function getCourseAssignments(int $courseId): array
    {
        /**
         * @var \App\Modules\Moodle\Entities\Assignment[]
         */
        $assignments = [];
        foreach($this->moodleWrapper->getAssignments([$courseId])['courses'][0]['assignments'] as $assignment) {
            $assignments[] = new Assignment(
                assignment_id: $assignment['id'],
                course_id: $courseId,
                name: $assignment['name'],
                nosubmissions: (bool) $assignment['nosubmissions'],
                allowsubmissionsfromdate: (int) $assignment['allowsubmissionsfromdate'],
                duedate: (int) $assignment['duedate'],
                grade: (int) $assignment['grade'],
                introattachments: array_map(function ($introattachment): IntroAttachment {
                    return new IntroAttachment(
                        filename: $introattachment['filename'],
                        filepath: $introattachment['filepath'],
                        filesize: $introattachment['filesize'],
                        fileurl: $introattachment['fileurl'],
                        timemodified: $introattachment['timemodified'],
                        mimetype: $introattachment['mimetype'],
                        isexternalfile: $introattachment['isexternalfile']
                    );
                }, $assignment['introattachments'])
            );
        }

        return $assignments;
    }
}
