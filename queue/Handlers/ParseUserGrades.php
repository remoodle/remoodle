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
            $this->connection->table("grades")->upsert($courseGradesUpsert, ["cmid", "moodle_id"], ["percantage"]);
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

        $currentGrades = array_map(function(&$key, $grade) use (&$currentGradesIds){
            $key = $grade["grade_id"];
            $currentGradesIds[] = $grade["grade_id"];
        }, $currentGrades); 

        $receivedGrades = array_map(function(&$key, $grade) use (&$receivedGradesIds){
            $key = $grade["grade_id"];
            $receivedGradesIds[] = $grade["grade_id"];
        }, $receivedGrades);

        $newGrades = array_diff($currentGrades, $receivedGrades);
    }
}