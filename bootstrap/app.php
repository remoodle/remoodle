<?php
use Slim\Factory\AppFactory;


/**
 * @var Psr\Container\ContainerInterface
 * Using PHP-DI container by default
 */
$container = require __DIR__ . "/container.php";
$app = AppFactory::createFromContainer($container);
return $app;