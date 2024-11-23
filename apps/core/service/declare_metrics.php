<?php

declare(strict_types=1);

use App\Modules\Jobs\JobsEnum;
use Core\Config;
use Spiral\Goridge\Relay;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Metrics\Collector;
use Spiral\RoadRunner\Metrics\CollectorType;
use Spiral\RoadRunner\Metrics\Metrics;

require_once __DIR__ . '/../vendor/autoload.php';

Config::loadConfigs();

$rpc = new RPC(
    Relay::create(Config::get('rpc.connection'))
);

$metrics = new Metrics($rpc);
$collectorType = CollectorType::Gauge;

foreach (JobsEnum::cases() as $enum) {
    $metrics->declare($collectorType->value . '_' . $enum->value, Collector::gauge());
}
