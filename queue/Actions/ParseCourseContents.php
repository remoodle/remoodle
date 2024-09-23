<?php

declare(strict_types=1);

namespace Queue\Actions;

use App\Models\MoodleUser;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Connection;

class ParseCourseContents
{
    public function __construct(
        private readonly MoodleUser $user,
        private readonly Connection $connection
    ) {
    }

    public function __invoke(): void
    {
        $moodle = Moodle::createFromToken($this->user->moodle_token, $this->user->moodle_id);

        $userCourses = $this->user
            ->courses
            ->pluck('course_id')
            ->all();

        $coursesContents = [];
        foreach ($userCourses as $userCourse) {
            $coursesContents[$userCourse] = $moodle->getCourseContent($userCourse);
        }

        $courseContentsUpsertArray = [];
        $courseContentsModulesUpsertArray = [];
        $courseContentsModulesAttachmentsUpsertArray = [];
        $courseContentsModulesDatesUpsertArray = [];
        $courseContentsModulesCompletionDataUpsertArray = [];

        foreach ($coursesContents as $courseId => $courseContents) {
            foreach ($courseContents as $courseContent) {
                $courseContentsUpsertArray[] = [
                    "content_id" => $courseContent->id,
                    "course_id" => $courseId,
                    "name" => $courseContent->name,
                    "section" => $courseContent->section,
                    "visible" => $courseContent->visible,
                    "uservisible" => $courseContent->uservisible,
                    "summaryformat" => $courseContent->summaryformat,
                    "hiddenbynumsections" => $courseContent->hiddenbynumsections,
                    "summary" => $courseContent->summary,
                ];

                foreach ($courseContent->modules as $courseContentModule) {
                    $courseContentsModulesUpsertArray[] = [
                        "cmid" => $courseContentModule->cmid,
                        "course_id" => $courseContentModule->course_id,
                        "content_id" => $courseContentModule->contentId,
                        "instance" => $courseContentModule->instance,
                        "contextid" => $courseContentModule->contextid,
                        "modname" => $courseContentModule->modname,
                        "modplural" => $courseContentModule->modplural,
                        "noviewlink" => $courseContentModule->noviewlink,
                        "visibleoncoursepage" => $courseContentModule->visibleoncoursepage,
                        "uservisible" => $courseContentModule->uservisible,
                        "url" => $courseContentModule->url,
                        "completion" => $courseContentModule->completion,
                        "description" => $courseContentModule->description,
                        "modicon" => $courseContentModule->modicon,
                        "name" => $courseContentModule->name,
                    ];

                    foreach ($courseContentModule->contents as $courseContentModuleContent) {
                        $courseContentsModulesAttachmentsUpsertArray[] = [
                            "hash" => $courseContentModuleContent->hash(),
                            "cmid" => $courseContentModuleContent->cmid,
                            "type" => $courseContentModuleContent->type,
                            "filename" => $courseContentModuleContent->filename,
                            "filepath" => $courseContentModuleContent->filepath,
                            "filesize" => $courseContentModuleContent->filesize,
                            "fileurl" => $courseContentModuleContent->fileurl,
                            "timecreated" => $courseContentModuleContent->timecreated,
                            "timemodified" => $courseContentModuleContent->timemodified,
                            "sortorder" => $courseContentModuleContent->sortorder,
                            "mimetype" => $courseContentModuleContent->mimetype,
                            "isexternalfile" => $courseContentModuleContent->isexternalfile,
                            "userid" => $courseContentModuleContent->userid,
                            "author" => $courseContentModuleContent->author,
                            "license" => $courseContentModuleContent->license,
                        ];
                    }

                    foreach ($courseContentModule->dates as $courseContentModuleDate) {
                        $courseContentsModulesDatesUpsertArray[] = [
                            "hash" => $courseContentModuleDate->hash(),
                            "cmid" => $courseContentModuleDate->cmid,
                            "label" => $courseContentModuleDate->label,
                            "timestamp" => $courseContentModuleDate->timestamp,
                        ];
                    }

                    if ($courseContentModule->completionData) {
                        $courseContentsModulesCompletionDataUpsertArray[] = [
                            "cmid" => $courseContentModule->completionData->cmid,
                            "overrideby" => $courseContentModule->completionData->overrideby,
                            "state" => $courseContentModule->completionData->state,
                            "timecompleted" => $courseContentModule->completionData->timecompleted,
                            "valueused" => $courseContentModule->completionData->valueused,
                            "hascompletion" => $courseContentModule->completionData->hascompletion,
                            "isautomatic" => $courseContentModule->completionData->isautomatic,
                            "istrackeduser" => $courseContentModule->completionData->istrackeduser,
                            "uservisible" => $courseContentModule->completionData->uservisible,
                        ];
                    }
                }
            }
        }

        $this->connection->beginTransaction();
        try {
            $this->connection->table('course_contents')->upsert($courseContentsUpsertArray, ['content_id']);
            $this->connection->table('course_modules')->upsert($courseContentsModulesUpsertArray, ['cmid']);
            $this->connection->table('course_module_attachments')->upsert($courseContentsModulesAttachmentsUpsertArray, ['hash'], );
            $this->connection->table('course_module_dates')->upsert($courseContentsModulesDatesUpsertArray, ['hash']);
            $this->connection->table('course_module_completion_data')->upsert($courseContentsModulesCompletionDataUpsertArray, ['cmid']);
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }
    }
}
