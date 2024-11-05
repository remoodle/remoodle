<?php

declare(strict_types=1);

namespace Queue\Actions;

use App\Models\MoodleUser;
use App\Modules\Moodle\Entities\Assignment;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
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
        $courses = $this->user->courses()->where('status', CourseEnrolledClassification::INPROGRESS)->get();
        $assisgnments = $moodle->getCoursesAssignments(
            ...($courses->pluck('course_id')->all())
        );

        $assignmentSubmissions = $moodle->getAssignmentSubmissions(...array_map(
            fn (Assignment $a): int => $a->assignment_id,
            $assisgnments
        ));

        $upsertAssignmentsArray = [];
        $upsertAssignmentContentsArray = [];
        $upsertAssignmentSubmissionArray = [];
        foreach ($assisgnments as $assisgnment) {
            if (isset($assignmentSubmissions[$assisgnment->assignment_id])) {
                $upsertAssignmentSubmissionArray[] = [
                    'submission_id' => $assignmentSubmissions[$assisgnment->assignment_id]->submission_id,
                    'timecreated' => $assignmentSubmissions[$assisgnment->assignment_id]->timecreated,
                    'timemodified' => $assignmentSubmissions[$assisgnment->assignment_id]->timemodified,
                    'submissionsenabled' => $assignmentSubmissions[$assisgnment->assignment_id]->submissionsenabled,
                    'extensionduedate' => $assignmentSubmissions[$assisgnment->assignment_id]->extensionduedate,
                    'cansubmit' => $assignmentSubmissions[$assisgnment->assignment_id]->cansubmit,
                    'graded' => $assignmentSubmissions[$assisgnment->assignment_id]->graded,
                    'moodle_id' => $this->user->moodle_id,
                    'assignment_id' => $assignmentSubmissions[$assisgnment->assignment_id]->assignment_id,
                    'submitted' => $assignmentSubmissions[$assisgnment->assignment_id]->submitted
                ];
            }

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
            $this->connection->table('user_assignment_submission')->upsert($upsertAssignmentSubmissionArray, ['moodle_id','assignment_id']);
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }

        // $this->searchEngine->putMany($assisgnments);
    }
}
