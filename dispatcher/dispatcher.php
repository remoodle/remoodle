<?php

use Core\Config;
use Dotenv\Dotenv;
use Illuminate\Database\Capsule\Manager as Capsule;
use Queue\HandlerFactory\Factory;
use Spiral\RoadRunner\Jobs\Consumer;

require_once __DIR__ . "/../vendor/autoload.php";


$dotenv = Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();

Config::loadConfigs();
$container = require __DIR__ . "/../bootstrap/container-di.php";

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

    unset($handler);
}
