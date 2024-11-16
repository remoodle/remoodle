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
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

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

$queueStorage = (new Factory(RPC::create(Config::get("rpc.connection"))))
    ->withSerializer(new IgbinarySerializer())->select('queue');

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
    if (! ($queueStorage->get(JobsEnum::PARSE_GRADES->value . $user->moodle_id, false))) {
        $task = $queueGrades->dispatch(
            $queueGrades->create(
                name: Task::class,
                payload: (new Payload(JobsEnum::PARSE_GRADES->value, $user))
            )
        );
        $queueStorage->set(JobsEnum::PARSE_GRADES->value . $user->moodle_id, true, 3600);
        echo '[LOCK] created for ' . $user->moodle_id . ' parse grades' . "\n";
    } else {
        echo '[LOCK] can\'t create due to lock ' . $user->moodle_id . ' parse grades' . "\n";
    }
}
