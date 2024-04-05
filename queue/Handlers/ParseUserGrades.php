<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Jobs\FactoryInterface;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Connection;

class ParseUserGrades extends BaseHandler
{
    private Connection $connection;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
        $this->jobsFactory = $this->get(FactoryInterface::class);
    }

    protected function dispatch(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = $this->getPayload()->payload();
        $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);

        $courseModulesUpsert = [];
        $courseGradesUpsert = [];

        foreach($user->courseAssigns as $courseAssign) {
            [$courseModules, $courseGrades] = $this->getCourseModulesAndGrades($courseAssign->course_id, $moodle);
            $courseModulesUpsert = array_merge($courseModulesUpsert, $courseModules);
            $courseGradesUpsert = array_merge($courseGradesUpsert, $courseGrades);
        }

        $this->connection->beginTransaction();

        try {
            $this->connection
                ->table("course_modules")
                ->upsert($courseModulesUpsert, "cmid");
            $this->connection
                ->table("grades")
                ->upsert($courseGradesUpsert, ["cmid", "moodle_id"], ["percentage"]);

            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }
    }

    /**
     * @param int $courseId
     * @param \App\Modules\Moodle\Moodle $moodle
     * @return array<int, array>
     */
    private function getCourseModulesAndGrades(int $courseId, Moodle $moodle): array
    {
        $courseGrades = $moodle->getCourseGrades($courseId);

        $courseModulesUpsertArray = [];
        $courseGradesUpsertArray = [];

        foreach($courseGrades as $courseGrade) {
            if($courseGrade->cmid === null) {
                continue;
            }

            $courseModulesUpsertArray[] = [
                "cmid" => $courseGrade->cmid,
                "course_id" => $courseGrade->course_id,
            ];
            $courseGradesUpsertArray[] = (array) $courseGrade;
        }

        return [$courseModulesUpsertArray, $courseGradesUpsertArray];
    }

    /**
     * @param array $currentGrades
     * @param array $receivedGrades
     * @return array<int, array>
     */
    private function getDifference(array $currentGrades, array $receivedGrades): array
    {
        $currentGradesIds = [];
        $receivedGradesIds = [];
        $updatedGrades = [];
        $newGrades = [];
        $tempCurrentGrades = [];
        foreach($currentGrades as $currentGrade) {
            $tempCurrentGrades[$currentGrade["grade_id"]] = $currentGrade;
            $currentGradesIds[] = $currentGrade["grade_id"];
        }
        $currentGrades = $tempCurrentGrades;
        unset($tempCurrentGrades);
        $tempreceivedGrades = [];
        foreach($receivedGrades as $receivedGrade) {
            $tempreceivedGrades[$receivedGrade["grade_id"]] = $receivedGrade;
            $receivedGradesIds[] = $receivedGrade["grade_id"];
            if(isset($currentGrades[$receivedGrade["grade_id"]]) && $currentGrades[$receivedGrade["grade_id"]]["percentage"] !== $receivedGrade["percentage"]) {
                $updatedGrades[] = [
                    "grade_id" => $receivedGrade["grade_id"],
                    "old" => $currentGrades[$receivedGrade["grade_id"]]["percentage"],
                    "new" => $receivedGrade["percentage"]
                ];
            } elseif(!isset($currentGrades[$receivedGrade["grade_id"]])) {
                $newGrades[] = [
                    "grade_id" => $receivedGrade["grade_id"],
                    "new" => $receivedGrade["percentage"]
                ];
            }
        }
        return [$updatedGrades, $newGrades];
    }
}
