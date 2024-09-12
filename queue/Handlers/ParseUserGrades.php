<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Moodle\Moodle;
use App\Modules\Search\SearchEngineInterface;
use Illuminate\Database\Connection;

class ParseUserGrades extends BaseHandler
{
    private Connection $connection;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
    }

    protected function dispatch(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = $this->getPayload()->payload();
        $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);

        $courseModulesUpsert = [];
        $courseGradesUpsert = [];

        foreach ($user->courseAssigns as $courseAssign) {
            [$courseModules, $courseGrades, $gradeEntities] = $this->getCourseModulesAndGrades($courseAssign->course_id, $moodle);
            $courseModulesUpsert = array_merge($courseModulesUpsert, $courseModules);
            $courseGradesUpsert = array_merge($courseGradesUpsert, $courseGrades);
        }

        $this->connection->beginTransaction();

        try {
            // $this->connection
            //     ->table("course_modules")
            //     ->upsert($courseModulesUpsert, "cmid");
            $this->connection
                ->table("grades")
                ->upsert(
                    $courseGradesUpsert,
                    ["moodle_id", "grade_id"],
                    ["percentage", "graderaw", "feedbackformat", "feedback"]
                );
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }

        // $this->searchEngine->putMany($gradeEntities);
    }

    /**
     * @param int $courseId
     * @param \App\Modules\Moodle\Moodle $moodle
     * @return array{array, array, \App\Modules\Moodle\Entities\Grade[]}
     */
    private function getCourseModulesAndGrades(int $courseId, Moodle $moodle): array
    {
        $courseGrades = $moodle->getCourseGrades($courseId);
        $courseGradesFiltered = [];

        $courseModulesUpsertArray = [];
        $courseGradesUpsertArray = [];
        foreach ($courseGrades as $courseGrade) {
            if ($courseGrade->itemtype === 'category' && $courseGrade->cmid === null && $courseGrade->name === '') {
                continue;
            }
            if ($courseGrade->itemtype === 'course' && $courseGrade->cmid === null && $courseGrade->name === '') {
                $courseGrade = $courseGrade->with(name: 'Total');
            }

            $courseGradesFiltered[] = $courseGrade;
            $courseGradesUpsertArray[] = (array) $courseGrade;
            if ($courseGrade->cmid === null) {
                continue;
            }

            $courseModulesUpsertArray[] = [
                "cmid" => $courseGrade->cmid,
                "course_id" => $courseId,
            ];
        }

        return [$courseModulesUpsertArray, $courseGradesUpsertArray, $courseGradesFiltered];
    }

    /**
     * @param array $currentGrades
     * @param array $receivedGrades
     * @return array<int, array>
     * @phpstan-ignore-next-line
     */
    private function getDifference(array $currentGrades, array $receivedGrades): array
    {
        $currentGradesIds = [];
        $receivedGradesIds = [];
        $updatedGrades = [];
        $newGrades = [];
        $tempCurrentGrades = [];
        foreach ($currentGrades as $currentGrade) {
            $tempCurrentGrades[$currentGrade["grade_id"]] = $currentGrade;
            $currentGradesIds[] = $currentGrade["grade_id"];
        }
        $currentGrades = $tempCurrentGrades;
        unset($tempCurrentGrades);
        $tempreceivedGrades = [];
        foreach ($receivedGrades as $receivedGrade) {
            $tempreceivedGrades[$receivedGrade["grade_id"]] = $receivedGrade;
            $receivedGradesIds[] = $receivedGrade["grade_id"];
            if (isset($currentGrades[$receivedGrade["grade_id"]]) && $currentGrades[$receivedGrade["grade_id"]]["percentage"] !== $receivedGrade["percentage"]) {
                $updatedGrades[] = [
                    "grade_id" => $receivedGrade["grade_id"],
                    "old" => $currentGrades[$receivedGrade["grade_id"]]["percentage"],
                    "new" => $receivedGrade["percentage"]
                ];
            } elseif (!isset($currentGrades[$receivedGrade["grade_id"]])) {
                $newGrades[] = [
                    "grade_id" => $receivedGrade["grade_id"],
                    "new" => $receivedGrade["percentage"]
                ];
            }
        }
        return [$updatedGrades, $newGrades];
    }
}
