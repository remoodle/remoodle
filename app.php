<?php

use App\Middleware\ErrorMiddleware;
use Core\Config;
use Slim\Factory\AppFactory;
use Spiral\RoadRunner\Http\PSR7WorkerInterface;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Connection;

require_once __DIR__ . "/vendor/autoload.php";

Config::loadConfigs();

/**@var Core\Container */
$container = require __DIR__ . "/bootstrap/container-laravel.php";
$routes = require __DIR__ . "/routes/api.php";

$capsule = new Capsule($container);
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();

/**@var Slim\App */
$app = AppFactory::createFromContainer($container);
$app->addBodyParsingMiddleware();

$routes($app);
// $app->addErrorMiddleware(true, true, true);
$app->addMiddleware($container->get(ErrorMiddleware::class));

$capsule->bootEloquent();
$container->bind(Connection::class, function() use ($capsule){
    return $capsule->getConnection();
});
$worker = $container->get(PSR7WorkerInterface::class);
while ($req = $worker->waitRequest()) {
    if($req === null){
        continue;
    }
    try {
        try {
            $pdo = $capsule->getConnection()->getPdo();
            if($pdo === null){
                throw new PDOException();
            }
        } catch (\Throwable $th) {
            $capsule->getConnection()->reconnect();
        }

        $res = $app->handle($req);
        $worker->respond($res);
    } catch (Throwable $e) {
        $worker->getWorker()->error($e->getMessage());
    }
}