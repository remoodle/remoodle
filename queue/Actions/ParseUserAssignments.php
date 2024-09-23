<?php

declare(strict_types=1);

namespace Queue\Actions;

use App\Models\MoodleUser;
use App\Modules\Moodle\Moodle;
use App\Modules\Search\SearchEngineInterface;
use Illuminate\Database\Connection;

class ParseUserAssignments
{
    public function __construct(
        private readonly MoodleUser $user,
        private readonly Connection $connection,
        private readonly SearchEngineInterface $searchEngine,
    ) {
    }

    public function __invoke(): void
    {
        $moodle = Moodle::createFromToken($this->user->moodle_token, $this->user->moodle_id);
        $assisgnments = $moodle->getCoursesAssignments(
            ...($this->user
            ->courses
            ->pluck('course_id')
            ->all())
        );

        $upsertAssignmentsArray = [];
        $upsertAssignmentContentsArray = [];
        foreach ($assisgnments as $assisgnment) {
            $upsertAssignmentsArray[] = [
                'assignment_id' => $assisgnment->assignment_id,
                'course_id' => $assisgnment->course_id,
                'cmid' => $assisgnment->cmid,
                'name' => $assisgnment->name,
                'nosubmissions' => $assisgnment->nosubmissions,
                'duedate' => $assisgnment->duedate,
                'allowsubmissionsfromdate' => $assisgnment->allowsubmissionsfromdate,
                'grade' => $assisgnment->grade,
                'intro' => $assisgnment->intro,
                'introformat' => $assisgnment->introformat,
            ];

            foreach ($assisgnment->introattachments as $introattachment) {
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
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }

        // $this->searchEngine->putMany($assisgnments);
    }
}
