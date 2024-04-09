<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle\Concrete;

use App\Modules\Moodle\Entities\Event as EventEntity;
use App\Modules\Moodle\Entities\Course as CourseEntity;
use App\Modules\Moodle\Entities\Grade as GradeEntity;
use App\Modules\Moodle\Entities\Assignment as AssignmentEntity;
use App\Models\{Assignment, AssignmentAttachment, Course, Event, Grade, MoodleUser};
use App\Modules\Moodle\BaseMoodleUser;
use App\Modules\Moodle\Entities\IntroAttachment;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;

class DatabaseUserMoodleRepository implements DatabaseUserMoodleRepositoryInterface
{
    // public function __construct(
    // private Connection $connection
    // ){}

    /**
     * @inheritDoc
     */
    public function getCourseAssigments(int $moodleId, string $moodleToken, int $courseId): array
    {
        return Assignment::where("course_id", $courseId)
            ->with(['attachments'])
            ->get()
            ->map(function (Assignment $assignment): AssignmentEntity {
                return new AssignmentEntity(
                    assignment_id: $assignment->assignment_id,
                    course_id: $assignment->course_id,
                    name: $assignment->name,
                    nosubmissions: (bool)$assignment->nosubmissions,
                    duedate: $assignment->duedate,
                    allowsubmissionsfromdate: $assignment->allowsubmissionsfromdate,
                    grade: $assignment->grade,
                    introattachments: $assignment
                        ->attachments
                        ->map(function (AssignmentAttachment $attachment): IntroAttachment {
                            return new IntroAttachment(
                                filename: $attachment->filename,
                                filepath: $attachment->filepath,
                                filesize: $attachment->filesize,
                                fileurl: $attachment->fileurl,
                                timemodified: $attachment->timemodified,
                                mimetype: $attachment->mimetype,
                                isexternalfile: (bool)$attachment->isexternalfile,
                            );
                        })
                        ->all()
                );
            })
            ->all();
    }

    /**
     * @inheritDoc
     */
    public function getActiveCourses(int $moodleId, string $moodleToken): array
    {
        return MoodleUser::query()
            ->with([
                "courses" => function ($query) {
                    $query->orderBy("course_id", "desc");
                }
            ])
            ->where("moodle_id", $moodleId)
            ->first()
            ->courses
            ->map(function (Course $course) {
                return new CourseEntity(
                    course_id: $course->course_id,
                    name: $course->name,
                    coursecategory: $course->coursecategory,
                    start_date: $course->start_date,
                    end_date: $course->end_date,
                    url: $course->url
                );
            })
            ->all();

    }

    public function getCourseGrades(int $moodleId, string $moodleToken, int $courseId): array
    {
        return Grade::where("moodle_id", $moodleId)
            ->where("course_id", $courseId)
            ->get()
            ->map(function (Grade $elem) use ($courseId) {
                return new GradeEntity(
                    grade_id: $elem->grade_id,
                    course_id: $courseId,
                    cmid: $elem->cmid,
                    percentage: $elem->percentage,
                    moodle_id: $elem->moodle_id,
                    itemtype: $elem->itemtype,
                    name: $elem->name
                );
            })
            ->all();
    }

    public function getUserInfo(string $moodleToken): ?BaseMoodleUser
    {
        $moodleUser = MoodleUser::findByToken($moodleToken);
        return $moodleUser ? new BaseMoodleUser($moodleToken, $moodleUser->username, $moodleUser->name, $moodleUser->moodle_id) : null;
    }

    //SHIT
    //TODO: REFACTOR
    public function findByIdentifiers(
        ?string $token = null,
        ?int $moodleId = null,
        ?string $username = null,
        ?string $nameAlias = null
    ): ?MoodleUser {
        if (!($token || $moodleId || $username || $nameAlias)) {
            return null;
        }

        $query = MoodleUser::query();

        $query->where(function ($q) use ($token, $moodleId, $username, $nameAlias) {
            if ($token) {
                $q->orWhere("moodle_token", $token);
            }
            if ($moodleId) {
                $q->orWhere("moodle_id", $moodleId);
            }
            if ($username) {
                $q->orWhere("username", $username);
            }
            if ($nameAlias) {
                $q->orWhere("name_alias", $nameAlias);
            }
        });

        return $query->first();
    }

    /**
     * @inheritDoc
     */
    public function getDeadlines(int $moodleId, string $moodleToken): array
    {
        return MoodleUser::query()
            ->with([
                "events" => function ($query) {
                    $query->where("timestart", ">", time());
                }
            ])
            ->where("moodle_id", $moodleId)
            ->first()
            ->events
            ->map(function (Event $event) {
                return new EventEntity(
                    event_id: $event->event_id,
                    timestart: $event->timestart,
                    instance: $event->instance,
                    name: $event->name,
                    visible: (bool)$event->visible,
                    course_id: $event->course_id,
                    course_name: $event->course_name
                );
            })
            ->all();
    }

}
