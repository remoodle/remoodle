<?php

declare(strict_types=1);
use App\Middleware\ErrorMiddleware;
use App\Modules\Search\Lemmetizations\KeyValueLemmetization;
use Core\Config;
use Slim\Factory\AppFactory;
use Spiral\RoadRunner\Http\PSR7WorkerInterface;
use Illuminate\Database\Connection;

require_once __DIR__ . "/vendor/autoload.php";

Config::loadConfigs();

/**@var Core\Container */
$container = require __DIR__ . "/bootstrap/container-laravel.php";
$routes = require __DIR__ . "/routes/api.php";

while($container->get(Spiral\RoadRunner\KeyValue\Factory::class)->select('lemmetization')->get("lemme_map") === null) {
    sleep(1);
}
KeyValueLemmetization::bootstrap($container->get(Spiral\RoadRunner\KeyValue\Factory::class)->select('lemmetization')->get("lemme_map"));

$worker = $container->get(PSR7WorkerInterface::class);
while (true) {
    $req = $worker->waitRequest();
    if($req === null) {
        continue;
    }

    /**@var Slim\App */
    $app = AppFactory::createFromContainer($container);
    $app->addBodyParsingMiddleware();

    $routes($app);

    if(Config::get('app.mode') !== 'production') {
        $app->addErrorMiddleware(true, true, true);
    } else {
        $app->addMiddleware($container->get(ErrorMiddleware::class));
    }

    try {
        try {
            $connection = $container->get(Connection::class);
            $pdo = $connection->getPdo();
            if($pdo === null) {
                throw new PDOException();
            }
        } catch (\Throwable $th) {
            $connection->reconnect();
        }

        $res = $app->handle($req);
        $worker->respond($res);
    } catch (Throwable $e) {
        $worker->getWorker()->error($e->getMessage());
    }

    // finally {
    //     gc_collect_cycles();
    // }
}
