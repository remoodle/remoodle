<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Moodle\Moodle;
use Illuminate\Database\Connection;

class ParseUserAssignments extends BaseHandler
{
    private Connection $connection;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
    }

    protected function dispatch(): void
    {
        /**
         * @var \App\Models\MoodleUser
         */
        $user = $this->getPayload()->payload();
        $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);
        $assisgnments = $moodle->getCoursesAssignments(
            ...$user
            ->courses
            ->pluck('course_id')
            ->all()
        );

        $upsertAssignmentsArray = [];
        $upsertAssignmentContentsArray = [];
        foreach($assisgnments as $assisgnment) {
            $upsertAssignmentsArray[] = [
                'assignment_id' => $assisgnment->assignment_id,
                'course_id' => $assisgnment->course_id,
                'name' => $assisgnment->name,
                'nosubmissions' => $assisgnment->nosubmissions,
                'duedate' => $assisgnment->duedate,
                'allowsubmissionsfromdate' => $assisgnment->allowsubmissionsfromdate,
                'grade' => $assisgnment->grade,
            ];

            foreach($assisgnment->introattachments as $introattachment) {
                $upsertAssignmentContentsArray[] = [
                    'hash' => $introattachment->hash($assisgnment->assignment_id),
                    'filename' => $introattachment->filename,
                    'filepath' => $introattachment->filepath,
                    'filesize' => $introattachment->filesize,
                    'fileurl' => $introattachment->fileurl,
                    'timemodified' => $introattachment->timemodified,
                    'mimetype' => $introattachment->mimetype,
                    'isexternalfile' => $introattachment->isexternalfile,
                    'assignment_id' => $assisgnment->assignment_id,
                ];
            }
        }

        $this->connection->beginTransaction();
        try {
            $this->connection->table('assignments')->upsert($upsertAssignmentsArray, ['assignment_id']);
            $this->connection->table('assignment_attachments')->upsert($upsertAssignmentContentsArray, ['hash']);
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }

        $this->connection->commit();
    }
}
