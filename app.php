<?php

use App\Middleware\ErrorMiddleware;
use Core\Config;
use Dotenv\Dotenv;
use Slim\Factory\AppFactory;
use Spiral\RoadRunner\Http\PSR7WorkerInterface;
use Illuminate\Database\Capsule\Manager as Capsule;

require_once __DIR__ . "/vendor/autoload.php";

$dotenv = Dotenv::createImmutable(__DIR__ . "/");
$dotenv->load();

Config::loadConfigs();

/**@var DI\Container */
$container = require __DIR__ . "/bootstrap/container-di.php";
$routes = require __DIR__ . "/routes/api.php";

$capsule = new Capsule;
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();

/**@var Slim\App */
$app = AppFactory::createFromContainer($container);
$app->addBodyParsingMiddleware();
$routes($app);
// $app->addErrorMiddleware(true, true, true);
$app->addMiddleware($app->getContainer()->get(ErrorMiddleware::class));

$capsule->bootEloquent();
$worker = $container->get(PSR7WorkerInterface::class);
while (true) {
    $req = $worker->waitRequest();
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
    } finally{
        gc_collect_cycles();
    }
}