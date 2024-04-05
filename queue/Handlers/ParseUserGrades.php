<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Modules\Jobs\FactoryInterface;
use App\Modules\Jobs\JobsEnum;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Connection;
use Spiral\RoadRunner\Jobs\Task\Task;

class ParseUserGrades extends BaseHandler
{
    private Connection $connection;
    private FactoryInterface $jobsFactory;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
        $this->jobsFactory = $this->get(FactoryInterface::class);
    }

    public function handle(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = new MoodleUser(json_decode($this->receivedTask->getPayload(), true));
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

            $queue = $this->jobsFactory->createQueue(JobsEnum::PARSE_EVENTS->value);
            $task = $queue->create(Task::class, $user->toJson());
            $queue->dispatch($task);

            $this->connection->commit();
            $this->receivedTask->complete();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            $this->receivedTask->fail($th);
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
