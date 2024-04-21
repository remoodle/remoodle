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

require_once __DIR__ . "/../vendor/autoload.php";

Config::loadConfigs();

$capsule = new Capsule();

$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$capsule->bootEloquent();

$jobs = new Jobs(RPC::create(Config::get("rpc.connection")));
$queue = $jobs->connect('user_parse_events');

$users = MoodleUser::all();

foreach($users as $user) {
    $queue->dispatch(
        $queue->create(
            name: Task::class,
            payload: (new Payload(JobsEnum::PARSE_GRADES->value, $user))
        )
    );
    echo "\n\nPUSHED GRADE " . $user->name . "\n\n";
    $queue->dispatch(
        $queue->create(
            name: Task::class,
            payload: (new Payload(JobsEnum::PARSE_EVENTS->value, $user))
        )
    );
}
