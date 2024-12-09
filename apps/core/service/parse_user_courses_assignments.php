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
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

require_once __DIR__ . "/../vendor/autoload.php";

Config::loadConfigs();

$capsule = new Capsule();
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$capsule->bootEloquent();

$jobs = new Jobs(RPC::create(Config::get("rpc.connection")));
$queue = $jobs->connect(JobsEnum::PARSE_COURSES->value);

$users = MoodleUser::where('initialized', true)->get();
$queueStorage = (new Factory(RPC::create(Config::get("rpc.connection"))))
    ->withSerializer(new IgbinarySerializer())->select('queue');

foreach ($users as $user) {
    if ($user->initialized) {
        if (boolval($queueStorage->get(JobsEnum::PARSE_COURSES->value . $user->moodle_id, false)) === false) {
            $task = $queue->dispatch(
                $queue->create(
                    name: Task::class,
                    payload: (new Payload(JobsEnum::PARSE_COURSES->value, $user))
                        ->add(new Payload(JobsEnum::PARSE_COURSE_CONTENTS->value, $user))
                        ->add(new Payload(JobsEnum::PARSE_ASSIGNMENTS->value, $user))
                )
            );

            $queueStorage->set(JobsEnum::PARSE_COURSES->value . $user->moodle_id, true, 3600);
            echo '[LOCK] created for ' . $user->moodle_id . ' parse courses' . "\n";
        } else {
            echo '[LOCK] can\'t create due to lock ' . $user->moodle_id . ' parse courses' . "\n";
        }
    }
}
