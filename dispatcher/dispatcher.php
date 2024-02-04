<?php

use Queue\HandlerFactory\Factory;
use Spiral\RoadRunner\Jobs\Consumer;

require_once __DIR__ . "/../vendor/autoload.php";

$container = require __DIR__ . "/../bootstrap/container.php";
$consumer = new Consumer();

/**@var Factory */
$factory = $container->get(Factory::class);

while ($task = $consumer->waitTask()) {
    $handler = $factory->createHandler($task);
    if($handler === null){
        $queue = $task->getQueue();
        echo("\n Handler not found for $queue\n");
        continue;
    } 

    $handler->handle($task);

}