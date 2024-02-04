<?php

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
$container = require __DIR__ . "/bootstrap/container.php";

$routes = require __DIR__ . "/routes/app.php";

$capsule = new Capsule;
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$app = AppFactory::createFromContainer($container);
$app->addBodyParsingMiddleware();
$routes($app);
$app->addErrorMiddleware(true, true, true);
$worker = $container->get(PSR7WorkerInterface::class);
while ($req = $worker->waitRequest()) {
    try {
        /**@var Slim\App */

        //Booting eloquent
        $capsule->bootEloquent();

        $res = $app->handle($req);
        $worker->respond($res);

    } catch (Throwable $e) {
        $worker->getWorker()->error($e->getMessage());
    } finally{
        $capsule->getConnection()->disconnect();
    }
}