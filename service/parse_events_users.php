<?php

use App\Models\MoodleUser;
use Core\Config;
use Illuminate\Database\Capsule\Manager as Capsule;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\Task\Task;

require_once __DIR__ . "/../vendor/autoload.php";

Config::loadConfigs();

$capsule = new Capsule;

$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$capsule->bootEloquent();

$jobs = new Jobs(RPC::create(Config::get("rpc.connection")));
$queue = $jobs->connect('user_parse_events');

$users = MoodleUser::all();

foreach($users as $user){
    $task = $queue->create(Task::class, $user->toJson());
    $queue->dispatch($task);
}


