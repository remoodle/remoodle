<?php

declare(strict_types=1);

use Core\Container;
use Core\Config;
use Psr\Container\ContainerInterface;

$container = new Container();
$container->bind(ContainerInterface::class, function () use ($container) {
    return $container;
});

foreach(Config::get("container") as $provider) {
    $container->loadProvider($provider);
}

return $container;
