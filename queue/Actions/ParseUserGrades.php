<?php

declare(strict_types=1);

namespace Queue\Actions;

use App\Models\Grade;
use App\Modules\Moodle\Entities\Grade as GradeEntity;
use App\Modules\Moodle\Entities\Course as CourseEntity;
use App\Models\MoodleUser;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use GuzzleHttp\Client;
use Illuminate\Database\Connection;
use Queue\Actions\Batch\GetGradesBatch;
use Queue\Actions\Grade\CourseGradeDiff;
use Queue\Actions\Grade\GradeChangePayload;
use Queue\Actions\Grade\GradeDiff;

class ParseUserGrades
{
    public function __construct(
        private Connection $connection,
        private MoodleUser $moodleUser,
        private string $moodleWebservicesUrl,
        private string $gradeChangeWebhookUrl,
        private string $gradeChangeCrossToken,
        private bool $webhookPushEnabled
    ) {
    }

    public function __invoke()
    {
        $courses = $this->moodleUser
            ->courses()
            ->where('status', CourseEnrolledClassification::INPROGRESS)
            ->get()
        ;

        $courseIds = $courses->pluck('course_id')->all();
        $courses = $courses->keyBy('course_id')->all();

        $userOldGrades = $this->moodleUser
            ->grades()
            ->get()
            ->keyBy('grade_id')
            ->map(fn (Grade $grade): GradeEntity => $grade->toEntity())
            ->all()
        ;

        $courseGradesTotalUpsert = (new GetGradesBatch($this->moodleWebservicesUrl))->__invoke(
            $this->moodleUser->moodle_token,
            $this->moodleUser->moodle_id,
            ...$courseIds
        );

        ['update' => $update, 'insert' => $insert] = $this->getDbDiffs($userOldGrades, $courseGradesTotalUpsert);

        if ($insert === []) {
            try {
                $this->connection->table('grades')->insert(
                    array_map(fn (GradeEntity $ge): array => (array) $ge, $insert),
                );
            } catch (\Throwable $th) {
                throw $th;
            }
        }

        if ($update === []) {
            try {
                $this->connection
                    ->table("grades")
                    ->upsert(
                        array_map(fn (GradeEntity $ge): array => (array)$ge, $update),
                        ["moodle_id", "grade_id"],
                        ["percentage", "graderaw", "feedbackformat", "feedback"]
                    );
            } catch (\Throwable $th) {
                throw $th;
            }
        }

        if ($this->webhookPushEnabled) {
            $gradesDiff = $this->diffGrades($userOldGrades, $courseGradesTotalUpsert, $courses);

            if ($gradesDiff === false) {
                return;
            }


            $gradeChangePayload = new GradeChangePayload(
                $this->moodleUser->moodle_id,
                $gradesDiff
            );

            $client = new Client(['verify' => false]);
            $client->post($this->gradeChangeWebhookUrl, [
                'json' => $gradeChangePayload->toArray(),
                'headers' => [
                    'X-Remoodle-Webhook-Secret' => $this->gradeChangeCrossToken
                ]
            ]);
        }
    }

    /**
     * @param GradeEntity[] $oldGrades
     * @param GradeEntity[] $newGrades
     * @param CourseEntity[] $userCourses
     * @return bool|CourseGradeDiff[]
     */
    private function diffGrades(array $oldGrades, array $newGrades, array $userCourses): bool|array
    {
        $hasChanges = false;
        $result = [];
        $diffsByCourses = [];
        foreach ($newGrades as $newGrade) {
            if (isset($oldGrades[$newGrade->grade_id])) {
                if ($oldGrades[$newGrade->grade_id]->graderaw === null && $newGrade->graderaw === null) {
                    continue;
                }

                $old = number_format((float)$oldGrades[$newGrade->grade_id]->graderaw, 2, '.', "");
                $new = number_format((float)$newGrade->graderaw, 2, '.', "");

                if ($old !== $new) {
                    $diffsByCourses[$newGrade->course_id][] = new GradeDiff(
                        $newGrade->name,
                        $oldGrades[$newGrade->grade_id]->graderaw,
                        $newGrade->graderaw
                    );
                    $hasChanges = true;
                    continue;
                }

                continue;
            }

            if ($newGrade->graderaw !== null) {
                $diffsByCourses[$newGrade->course_id][] = new GradeDiff(
                    $newGrade->name,
                    null,
                    $newGrade->graderaw
                );
                $hasChanges = true;
            }
        }

        if ($hasChanges === false) {
            return false;
        }

        foreach ($diffsByCourses as $courseId => $diffsByCourse) {
            $result[] = new CourseGradeDiff(
                $userCourses[$courseId]->name,
                $diffsByCourse,
                $courseId
            );
        }

        return $result;
    }

    /**
     * @param array<int, GradeEntity> $oldGrades
     * @param GradeEntity[] $newGrades
     * @return array{update: GradeEntity[], insert: GradeEntity[]}
     */
    private function getDbDiffs(array $oldGrades, array $newGrades): array
    {
        $insert = [];
        $update = [];
        foreach ($newGrades as $newGrade) {
            if (!isset($oldGrades[$newGrade->grade_id])) {
                $insert[] = $newGrade;
                continue;
            }

            $old = number_format((float)$oldGrades[$newGrade->grade_id]->graderaw, 2, '.', "");
            $new = number_format((float)$newGrade->graderaw, 2, '.', "");

            if (
                ($newGrade->percentage !== $oldGrades[$newGrade->grade_id]->percentage) ||
                ($old !== $new) ||
                ($newGrade->feedbackformat !== $oldGrades[$newGrade->grade_id]->feedbackformat) ||
                ($newGrade->feedback !== $oldGrades[$newGrade->grade_id]->feedback)
            ) {
                $update[] = $newGrade;
                continue;
            }
        }

        return [
            'update' => $update,
            'insert' => $insert
        ];
    }
}
