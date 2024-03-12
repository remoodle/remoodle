<?php 

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Connection;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\Task\Task;

class ParseUserGrades extends BaseHandler
{
    private Moodle $moodle;
    private Connection $connection;
    private MoodleUser $user;

    public function handle(): void
    {
        /**@var \App\Models\MoodleUser */
        $this->user = new MoodleUser(json_decode($this->receivedTask->getPayload(), 1));

        $this->moodle = Moodle::createFromToken($this->user->moodle_token, $this->user->moodle_id);
        $this->connection = Manager::connection();

        $courseModulesUpsert = [];
        $courseGradesUpsert = [];

        foreach($this->user->courseAssigns as $courseAssign){
            [$courseModules, $courseGrades] = $this->getCourseModulesAndGrades($courseAssign->course_id, $courseAssign->moodle_id);
            $courseModulesUpsert = array_merge($courseModulesUpsert, $courseModules);
            $courseGradesUpsert = array_merge($courseGradesUpsert, $courseGrades);
        }

        try {
            $this->connection->beginTransaction();
            $this->connection->table("course_modules")->upsert($courseModulesUpsert, "cmid");
            $this->connection->table("grades")->upsert($courseGradesUpsert, ["cmid", "moodle_id"], ["percentage"]);
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            $this->receivedTask->fail($th);
        }
        
        $jobs = new Jobs(RPC::create('tcp://127.0.0.1:6001'));
        $queue = $jobs->connect('user_parse_events');
        $task = $queue->create(Task::class, $this->user->toJson());
        $queue->dispatch($task);



        $this->receivedTask->complete();
    }

    private function getCourseModulesAndGrades(int $courseId, int $moodleId): array
    {
        $courseGrades = $this->moodle->getCourseGrades($courseId);

        $courseModulesUpsertArray = [];
        $courseGradesUpsertArray = [];

        foreach($courseGrades as $courseGrade){
            $courseModulesUpsertArray[] = [
                "cmid" => $courseGrade["cmid"],
                "course_id" => (int)$courseGrade["course_id"],
            ];
            $courseGradesUpsertArray[] = [
                "grade_id" => $courseGrade["id"],
                "moodle_id" => $moodleId,
                "cmid" => $courseGrade["cmid"],
                "course_id" => $courseGrade["course_id"],
                "name" => $courseGrade["name"],
                "percentage" => $courseGrade["percentage"],
            ];
        }

        return [$courseModulesUpsertArray, $courseGradesUpsertArray];
    }

    private function getDifference(array $currentGrades, array $receivedGrades): array
    {
        $currentGradesIds = [];
        $receivedGradesIds = [];
        $updatedGrades = [];
        $newGrades = [];
        $tempCurrentGrades = [];
        foreach($currentGrades as $currentGrade){
            $tempCurrentGrades[$currentGrade["grade_id"]] = $currentGrade;
            $currentGradesIds[] = $currentGrade["grade_id"];
        }
        $currentGrades = $tempCurrentGrades;
        unset($tempCurrentGrades);
        $tempreceivedGrades = [];
        foreach($receivedGrades as $receivedGrade){
            $tempreceivedGrades[$receivedGrade["grade_id"]] = $receivedGrade;
            $receivedGradesIds[] = $receivedGrade["grade_id"];
            if(isset($currentGrades[$receivedGrade["grade_id"]]) && $currentGrades[$receivedGrade["grade_id"]]["percentage"] !== $receivedGrade["percentage"]){
                $updatedGrades[] = [
                    "grade_id" => $receivedGrade["grade_id"],
                    "old" => $currentGrades[$receivedGrade["grade_id"]]["percentage"],
                    "new" => $receivedGrade["percentage"]
                ];
            }elseif(!isset($currentGrades[$receivedGrade["grade_id"]])){
                $newGrades[] = [
                    "grade_id" => $receivedGrade["grade_id"],
                    "new" => $receivedGrade["percentage"]
                ];
            }
        }
        return [$updatedGrades, $newGrades];
    }
}