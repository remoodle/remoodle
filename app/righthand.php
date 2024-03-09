<?php

require __DIR__.'/vendor/autoload.php';

use Core\Commands\CreateController;
use Core\Commands\CreateMigration;
use Core\Commands\CreateModel;
use Core\Commands\CreateValidationMiddleware;
use Symfony\Component\Console\Application;

const BASE_DIR = __DIR__; 

$application = new Application();

$application->add(new CreateValidationMiddleware());
$application->add(new CreateController());
$application->add(new CreateValidationMiddleware());
$application->add(new CreateModel());
$application->add(new CreateMigration());

$application->run();