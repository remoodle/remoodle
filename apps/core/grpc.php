<?php

declare(strict_types=1);

use App\GRPC\Remoodle;
use Spiral\RoadRunner\GRPC\Server;
use Spiral\RoadRunner\Worker;
use App\Modules\Search\Lemmetizations\KeyValueLemmetization;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Core\Config;

require_once __DIR__ . "/vendor/autoload.php";

Config::loadConfigs();

/**@var Core\Container */
$container = require __DIR__ . "/bootstrap/container-laravel.php";

while($container->get(Spiral\RoadRunner\KeyValue\Factory::class)->select('lemmetization')->get("lemme_map") === null) {
    sleep(1);
}
KeyValueLemmetization::bootstrap($container->get(Spiral\RoadRunner\KeyValue\Factory::class)->select('lemmetization')->get("lemme_map"));

$server = new Server(options: [
    'debug' => false,
]);
$server->registerService(
    RemoodleServiceInterface::class,
    new Remoodle($container->get(DatabaseUserMoodleRepositoryInterface::class))
);
$server->serve(Worker::create());
