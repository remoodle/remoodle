<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle\Concrete;

use App\Modules\Moodle\Entities\Event as EventEntity;
use App\Modules\Moodle\Entities\Course as CourseEntity;
use App\Modules\Moodle\Entities\Grade as GradeEntity;
use App\Modules\Moodle\Entities\Assignment as AssignmentEntity;
use App\Models\{Assignment, AssignmentAttachment, Course, CourseContent, Event, Grade, MoodleUser};
use App\Modules\Moodle\BaseMoodleUser;
use App\Modules\Moodle\Entities\CourseContent as EntitiesCourseContent;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use App\Modules\Moodle\Entities\IntroAttachment;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Illuminate\Database\Connection;

class DatabaseUserMoodleRepository implements DatabaseUserMoodleRepositoryInterface
{
    public function __construct(
        private Connection $db
    ) {
    }

    /**
     * @inheritDoc
     */
    public function getCourseAssigments(int $moodleId, string $moodleToken, int $courseId): array
    {
        return Assignment::query()->where("course_id", $courseId)
            ->with([
                'attachments',
                'relatedGrade' => function ($query) use ($moodleId) {
                    $query->where("moodle_id", $moodleId);
                }])
            ->get()
            ->map(function ($assignment): AssignmentEntity {
                return $assignment->toEntity();
            })
            ->all();
    }

    /**
     * @inheritDoc
     */
    public function getCourses(int $moodleId, string $moodleToken, ?CourseEnrolledClassification $status = null): array
    {
        $courses = MoodleUser::query()
            ->with([
                "courses" => function ($query) use ($status) {
                    $query->orderBy("course_id", "desc");
                    if ($status !== null) {
                        $query->where('status', $status->value);
                    }
                }
            ])
            ->where("moodle_id", $moodleId)
            ->first()
            ?->courses
            ->map(function (Course $course) {
                return new CourseEntity(
                    course_id: $course->course_id,
                    name: $course->name,
                    coursecategory: $course->coursecategory,
                    start_date: $course->start_date,
                    end_date: $course->end_date,
                    url: $course->url,
                    status: CourseEnrolledClassification::from($course->status)
                );
            })
            ->all();

        return $courses;
    }

    public function getCourseGrades(int $moodleId, string $moodleToken, int $courseId): array
    {
        return Course::query()->where("course_id", $courseId)
            ->first()
            ?->grades()
            ->where("moodle_id", $moodleId)
            ->get()
            ->map(function (Grade $elem) {
                return $elem->toEntity();
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
        $user = MoodleUser::query()
            ->with([
                "eventsCommon" => function ($query) {
                    $query->where("timestart", ">", time());
                },
                "eventsCommon.assignment",
                "eventsCommon.assignment.relatedGrade" => function ($query) use ($moodleId) {
                    $query->where("moodle_id", $moodleId);
                },
                'eventsCommon.assignment.submission' => function ($query) use ($moodleId) {
                    $query->where('moodle_id', $moodleId);
                },
                "eventsGroups" => function ($query) {
                    $query->where("timestart", ">", time());
                },
                "eventsGroups.assignment",
                "eventsGroups.assignment.relatedGrade" => function ($query) use ($moodleId) {
                    $query->where("moodle_id", $moodleId);
                },
                'eventsGroups.assignment.submission' => function ($query) use ($moodleId) {
                    $query->where('moodle_id', $moodleId);
                },
            ])
            ->where("moodle_id", $moodleId)
            ->first();

        $events = array_merge($user->eventsGroups->all(), $user->eventsCommon->all());

        return array_map(function (Event $event) {
            return $event->toEntity();
        }, $events);
    }

    public function getAssignmentByCmid(int $moodleId, string $moodleToken, int $cmid): AssignmentEntity
    {
        return Assignment::query()->where("cmid", $cmid)->firstOrFail()->toEntity();
    }
    public function getGradeByCmid(int $moodleId, string $moodleToken, int $cmid): GradeEntity
    {
        return Grade::query()->where("cmid", $cmid)->firstOrFail()->toEntity();
    }

    public function getEventByInstance(int $moodleId, string $moodleToken, int $instance): EventEntity
    {
        return Event::query()->where("instance", $instance)->firstOrFail()->toEntity();
    }

    public function isUserAssignedToCourse(int $moodleId, int $courseId): bool
    {
        return $this
            ->db
            ->table("user_course_assign")
            ->where("moodle_id", $moodleId)
            ->where("course_id", $courseId)
            ->exists();
    }

    /**
     * @inheritDoc
     */
    public function getCourseContents(int $moodleId, string $moodleToken, int $courseId): array
    {
        return CourseContent::query()->where("course_id", $courseId)
            ->orderBy("section", "asc")
            ->with([
                'modules',
                'modules.dates',
                'modules.attachments',
                'modules.completionData',
            ])
            ->get()
            ->map(function (CourseContent $courseContent): EntitiesCourseContent {
                return $courseContent->toEntity();
            })->all();
    }
}
