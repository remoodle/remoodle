<?php

declare(strict_types=1);
use App\Models\MoodleUser;
use App\Modules\Jobs\JobsEnum;
use Core\Config;
use Illuminate\Database\Capsule\Manager as Capsule;
use Queue\Payload\Payload;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\Task\Task;
use Queue\Actions\Batch\Events\EventsBatchDto;

require_once __DIR__ . "/../vendor/autoload.php";

Config::loadConfigs();

$capsule = new Capsule();

$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$capsule->bootEloquent();

$jobs = new Jobs(RPC::create(Config::get("rpc.connection")));
$queueEvents = $jobs->connect(JobsEnum::BATCH_PARSE_EVENTS->value);
$queueGrades = $jobs->connect(JobsEnum::PARSE_GRADES->value);

$users = MoodleUser::where('initialized', true)->get();

$chunks = [];
foreach ($users->chunk(5)->all() as $chunk) {
    $parts = [];
    foreach ($chunk->all() as $user) {
        $dto = new EventsBatchDto($user->moodle_token, $user->moodle_id);
        $parts[] = $dto;
    }
    $queueEvents->dispatch(
        $queueEvents->create(
            name: Task::class,
            payload: (new Payload(JobsEnum::BATCH_PARSE_EVENTS->value, $parts))
        )
    );
}

foreach ($users as $user) {
    $queueGrades->dispatch(
        $queueGrades->create(
            name: Task::class,
            payload: (new Payload(JobsEnum::PARSE_GRADES->value, $user))
        )
    );
}
