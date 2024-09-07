<?php

declare(strict_types=1);

namespace App\Modules\Moodle;

use App\Modules\Moodle\Entities\Assignment;
use App\Modules\Moodle\Entities\Course;
use App\Modules\Moodle\Entities\CourseContent;
use App\Modules\Moodle\Entities\CourseModule;
use App\Modules\Moodle\Entities\CourseModuleAttachment;
use App\Modules\Moodle\Entities\CourseModuleCompletionData;
use App\Modules\Moodle\Entities\CourseModuleDate;
use App\Modules\Moodle\Entities\Event;
use App\Modules\Moodle\Entities\Grade;
use App\Modules\Moodle\Entities\IntroAttachment;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use Core\Config;
use Fugikzl\MoodleWrapper\Moodle as MoodleWrapperMoodle;
use GuzzleHttp\Client;

/**
 * НЕ СТОИТ ЛЕЗТЬ В ЭТО!!!!!!!!!!!!!!
 */
final class Moodle
{
    private const WEEK = 604800;

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

        if (array_key_exists('error', $res)) {
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
    public function getUserCourses(?CourseEnrolledClassification $classification = CourseEnrolledClassification::INPROGRESS): array
    {
        $coursesRaw = $classification === null
            ? array_merge(
                $this->moodleWrapper->getEnrolledCoursesByTimelineClassification(CourseEnrolledClassification::FUTURE->value)["courses"],
                $this->moodleWrapper->getEnrolledCoursesByTimelineClassification(CourseEnrolledClassification::INPROGRESS->value)["courses"],
                $this->moodleWrapper->getEnrolledCoursesByTimelineClassification(CourseEnrolledClassification::PAST->value)["courses"],
            )
            : $this->moodleWrapper->getEnrolledCoursesByTimelineClassification($classification->value)["courses"];
        $courses = [];

        foreach ($coursesRaw as $course) {
            $courses[] = new Course(
                course_id: (int)$course["id"],
                url: $course["viewurl"],
                coursecategory: $course["coursecategory"],
                name: $course["fullname"] ?? $course["shortname"],
                end_date: $course["startdate"],
                start_date: $course["enddate"],
                status: $classification,
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

        foreach ($rawGrades["usergrades"][0]['gradeitems'] as $gradeitem) {
            $gradeitem['percentageformatted'] = str_replace([' ', '%'], '', $gradeitem['percentageformatted']);
            $grade = is_numeric($gradeitem['percentageformatted'])
                ? (int) $gradeitem['percentageformatted']
                : null;

            $grades[] = new Grade(
                grade_id: $gradeitem['id'],
                course_id: $courseId,
                cmid: $gradeitem['cmid'] ?? null,
                name: $gradeitem['itemname'] ?? "",
                percentage: $grade,
                moodle_id: $this->moodleWrapper->getUserId(),
                itemtype: $gradeitem['itemtype'],
                itemmodule: $gradeitem['itemmodule'],
                iteminstance: $gradeitem['iteminstance'],
                grademin: $gradeitem['grademin'],
                grademax: $gradeitem['grademax'],
                feedbackformat: $gradeitem['feedbackformat'],
                graderaw: $gradeitem['graderaw'],
                feedback: $gradeitem['feedback'],
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
    public function getDeadlines(?int $from = null, ?int $to = null, bool $withAssignments = true): array
    {
        $from ??= time();
        $to ??= time() + static::WEEK * 4;

        $deadlines = $this->moodleWrapper->getCalendarActionByTimesort($from, $to);
        $events = [];
        $courses = [];

        foreach ($deadlines["events"] as $event) {
            $events[] = new Event(
                event_id: $event['id'],
                name: $event['name'],
                instance: $event['instance'],
                timestart: $event['timestart'],
                visible: (bool)$event['visible'],
                course_name: $event["course"]["shortname"] ?? $event["course"]["fullname"],
                course_id: $event['course']['id']
            );
            $courses[$event['course']['id']] = true;
        }

        if ($withAssignments) {
            $assignments = $this->getCoursesAssignments(...array_keys($courses));
            $assignmentsByCmid = [];
            foreach ($assignments as $assignment) {
                $assignmentsByCmid[$assignment->cmid] = $assignment;
            }

            foreach ($events as &$event) {
                if (isset($assignmentsByCmid[$event->instance])) {
                    $event = $event->withAssignment($assignmentsByCmid[$event->instance]);
                }
            }
        }
        return $events;
    }

    /**
     * @param int $courseId
     * @return \App\Modules\Moodle\Entities\Assignment[]
     */
    public function getCourseAssignments(int $courseId, bool $withGrades = true): array
    {
        /**
         * @var \App\Modules\Moodle\Entities\Assignment[]
         */
        $assignments = [];
        foreach ($this->moodleWrapper->getAssignments([$courseId])['courses'][0]['assignments'] as $assignment) {
            $assignments[] = new Assignment(
                assignment_id: $assignment['id'],
                course_id: $courseId,
                cmid: $assignment['cmid'],
                name: $assignment['name'],
                nosubmissions: (bool) $assignment['nosubmissions'],
                allowsubmissionsfromdate: (int) $assignment['allowsubmissionsfromdate'],
                duedate: (int) $assignment['duedate'],
                grade: (int) $assignment['grade'],
                intro: $assignment['intro'],
                introformat: (int) $assignment['introformat'],
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

        if ($withGrades) {
            $grades = $this->getCourseGrades($courseId);
            $gradesByCmid = [];
            foreach ($grades as $grade) {
                $gradesByCmid[$grade->cmid] = $grade;
            }

            foreach ($assignments as &$assignment) {
                if (isset($gradesByCmid[$assignment->cmid])) {
                    $assignment = $assignment->withGrade($gradesByCmid[$assignment->cmid]);
                }
            }
        }

        return $assignments;
    }

    /**
     * @return \App\Modules\Moodle\Entities\Assignment[]
     */
    public function getCoursesAssignments(int ...$courseIds): array
    {
        /**
         * @var \App\Modules\Moodle\Entities\Assignment[]
         */
        $assignments = [];
        foreach ($this->moodleWrapper->getAssignments($courseIds)['courses'] as $course) {
            foreach ($course['assignments'] as $assignment) {
                $assignments[] = new Assignment(
                    assignment_id: $assignment['id'],
                    course_id: $course['id'],
                    cmid: $assignment['cmid'],
                    name: $assignment['name'],
                    nosubmissions: (bool) $assignment['nosubmissions'],
                    allowsubmissionsfromdate: (int) $assignment['allowsubmissionsfromdate'],
                    duedate: (int) $assignment['duedate'],
                    grade: (int) $assignment['grade'],
                    intro: $assignment['intro'],
                    introformat: (int) $assignment['introformat'],
                    introattachments: array_map(function ($introattachment): IntroAttachment {
                        return new IntroAttachment(
                            filename: $introattachment['filename'],
                            filepath: $introattachment['filepath'],
                            filesize: $introattachment['filesize'],
                            fileurl: urldecode($introattachment['fileurl']),
                            timemodified: $introattachment['timemodified'],
                            mimetype: $introattachment['mimetype'],
                            isexternalfile: $introattachment['isexternalfile']
                        );
                    }, $assignment['introattachments'])
                );
            }
        }

        return $assignments;
    }

    /**
     * @param int $courseId
     * @return \App\Modules\Moodle\Entities\CourseContent[]
     */
    public function getCourseContent(int $courseId): array
    {
        $rawContents = $this->moodleWrapper->getCoursesInfo($courseId);
        $courseContents = [];
        foreach ($rawContents as $courseContent) {
            /**
             * @var \App\Modules\Moodle\Entities\CourseModule[]
             */
            $modules = [];
            $contentId = $courseContent["id"];
            foreach ($courseContent["modules"] as $courseModuleArray) {
                /**
                 * @var \App\Modules\Moodle\Entities\CourseModuleDate[]
                 */
                $dates = [];

                /**
                 * @var \App\Modules\Moodle\Entities\CourseModuleAttachment[]
                 */
                $contents = [];

                $completionData = null;

                /**
                 * @var int
                 */
                $cmid = $courseModuleArray["id"];
                foreach ($courseModuleArray["dates"] as $cousreModuleDate) {
                    $dates[] = new CourseModuleDate(
                        cmid: $cmid,
                        timestamp: $cousreModuleDate["timestamp"],
                        label: $cousreModuleDate["label"],
                    );
                }
                if (isset($courseModuleArray["contents"])) {
                    foreach ($courseModuleArray["contents"] as $cousreModuleAttachment) {

                        $contents[] = new CourseModuleAttachment(
                            cmid: $cmid,
                            type: $cousreModuleAttachment["type"],
                            filename: $cousreModuleAttachment["filename"],
                            filepath: $this->issetOrNullArray($cousreModuleAttachment, "filepath"),
                            filesize: $this->issetOrNullArray($cousreModuleAttachment, "filesize"),
                            fileurl: $this->issetOrNullArray($cousreModuleAttachment, "fileurl"),
                            timecreated: $this->issetOrNullArray($cousreModuleAttachment, "timecreated"),
                            timemodified: $this->issetOrNullArray($cousreModuleAttachment, "timemodified"),
                            sortorder: $cousreModuleAttachment["sortorder"],
                            mimetype: $this->issetOrNullArray($cousreModuleAttachment, "mimetype"),
                            isexternalfile: $this->issetOrNullArray($cousreModuleAttachment, "isexternalfile"),
                            userid: $this->issetOrNullArray($cousreModuleAttachment, "userid"),
                            author: $this->issetOrNullArray($cousreModuleAttachment, "author"),
                            license: $this->issetOrNullArray($cousreModuleAttachment, "license"),
                        );
                    }
                }

                if (isset($courseModuleArray["completiondata"])) {
                    $completionData = new CourseModuleCompletionData(
                        cmid: $cmid,
                        state: $courseModuleArray["completiondata"]["state"],
                        timecompleted: $courseModuleArray["completiondata"]["timecompleted"],
                        valueused: $courseModuleArray["completiondata"]["valueused"],
                        hascompletion: $courseModuleArray["completiondata"]["hascompletion"],
                        isautomatic: $courseModuleArray["completiondata"]["isautomatic"],
                        istrackeduser: $courseModuleArray["completiondata"]["istrackeduser"],
                        uservisible: $courseModuleArray["completiondata"]["uservisible"],
                        overrideby: $courseModuleArray["completiondata"]["overrideby"],
                    );
                }

                $modules[] = new CourseModule(
                    cmid: $cmid,
                    contentId: $contentId,
                    instance: $courseModuleArray["instance"],
                    contextid: $courseModuleArray["contextid"],
                    course_id: $courseId,
                    modname: $courseModuleArray["modname"],
                    modplural: $courseModuleArray["modplural"],
                    noviewlink: $courseModuleArray["noviewlink"],
                    visibleoncoursepage: $courseModuleArray["visibleoncoursepage"],
                    uservisible: $courseModuleArray["uservisible"],
                    url: $this->issetOrNullArray($courseModuleArray, "url"),
                    completion: $courseModuleArray["completion"],
                    description: $this->issetOrNullArray($courseModuleArray, "description") ?? "",
                    modicon: $courseModuleArray["modicon"],
                    name: $courseModuleArray["name"],
                    completionData: $completionData,
                    dates: $dates,
                    contents: $contents,
                );
            }

            $courseContents[] = new CourseContent(
                id: $courseContent["id"],
                name: $courseContent["name"],
                visible: $courseContent["visible"],
                section: $courseContent["section"],
                uservisible: $courseContent["uservisible"],
                summaryformat: $courseContent["summaryformat"],
                hiddenbynumsections: $courseContent["hiddenbynumsections"],
                modules: $modules,
                summary: $courseContent["summary"],
            );
        }

        return $courseContents;
    }

    private function issetOrNullArray(array $object, string $key): mixed
    {
        if (isset($object[$key])) {
            return $object[$key];
        }

        return null;
    }
}
