<?php

declare(strict_types=1);

use App\Modules\Search\Lemmetizations\KeyValueLemmetization;
use Core\Config;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Connection;
use Queue\HandlerFactory\Factory;
use Spiral\RoadRunner\Jobs\Consumer;

require_once __DIR__ . "/../vendor/autoload.php";

Config::loadConfigs();
$container = require __DIR__ . "/../bootstrap/container-laravel.php";

$capsule = new Capsule();
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();

$container->bind(Connection::class, function () use ($capsule) {
    return $capsule->getConnection();
});


KeyValueLemmetization::bootstrap(json_decode(file_get_contents(__DIR__ . '/../service/files/lemmatizedMap.json'), true));

/**@var Factory */
$factory = $container->get(Factory::class);
$consumer = new Consumer();

while ($task = $consumer->waitTask()) {

    if ($task == null) {
        continue;
    }

    $handler = $factory->createHandler($task, $container);

    if ($handler === null) {
        $task->fail("Unable to locate handler.");
        continue;
    }

    $capsule->bootEloquent();

    try {
        $handler->handle();
        echo "Completed task " . $task->getPipeline() . PHP_EOL;
    } catch (\Throwable $th) {
        $task->fail($th);
        echo "\n" . $th->getMessage();
    } finally {
        $capsule->getConnection()->disconnect();
    }
}
