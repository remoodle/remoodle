<?php

use Core\Config;
use Dotenv\Dotenv;

require_once __DIR__ . "/vendor/autoload.php";
$dotenv = Dotenv::createImmutable(__DIR__ . "/");
$dotenv->load();
Config::loadConfigs();
return Config::get("phinx");