<?php

use Core\Config;
use Illuminate\Database\Capsule\Manager as Capsule;
use Queue\HandlerFactory\Factory;
use Spiral\RoadRunner\Jobs\Consumer;

require_once __DIR__ . "/../vendor/autoload.php";

Config::loadConfigs();
$container = require __DIR__ . "/../bootstrap/container-laravel.php";

$capsule = new Capsule;
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();

/**@var Factory */
$factory = $container->get(Factory::class);
$consumer = new Consumer();

while (true) {
    $task = $consumer->waitTask();

    if($task === null){
        continue;
    }

    $handler = $factory->createHandler($task);
    
    if($handler === null){
        $task->fail("Unable to locate handler.");
        continue;
    }

    $capsule->bootEloquent();

    try {
        $handler->handle();
    } catch (\Throwable $th) {
        $task->fail($th);
        echo "\n" . $th->getMessage();
    }finally{
        $capsule->getConnection()->disconnect();
    }
}
