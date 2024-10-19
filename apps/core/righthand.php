<?php

declare(strict_types=1);
require __DIR__.'/vendor/autoload.php';

use Core\Commands\CreateController;
use Core\Commands\CreateMigration;
use Core\Commands\CreateModel;
use Core\Commands\CreateValidationMiddleware;
use Core\Commands\GenerateKey;
use Core\Config;
use Symfony\Component\Console\Application;

const BASE_DIR = __DIR__;

Config::loadConfigs();

$application = new Application();

$application->add(new CreateValidationMiddleware());
$application->add(new CreateController());
$application->add(new CreateValidationMiddleware());
$application->add(new CreateModel());
$application->add(new CreateMigration());
// $application->add(new GenerateKey());

$application->run();
