<?php

declare(strict_types=1);

namespace Core\ServiceProvider\Database;

use Core\Config;
use Core\ServiceProvider\ServiceProviderInterface;
use Core\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Connection;

class DatabaseProvider implements ServiceProviderInterface
{
    public function register(Container $container): void
    {
        $capsule = new Capsule($container);
        $capsule->addConnection(Config::get('eloquent'));
        $capsule->setAsGlobal();
        $capsule->bootEloquent();
        $container->bind(Connection::class, function () use ($capsule) {
            return $capsule->getConnection();
        });
    }

    public function boot(Container $container): void
    {

    }
}
