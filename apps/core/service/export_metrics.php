<?php

declare(strict_types=1);

use Core\Config;
use Spiral\Goridge\Relay;
use Spiral\Goridge\RPC\RPC;
use Spiral\Goridge\RPC\RPCInterface;
use Spiral\RoadRunner\Metrics\Collector;
use Spiral\RoadRunner\Metrics\CollectorType;
use Spiral\RoadRunner\Metrics\Metrics;

require_once __DIR__ . '/../vendor/autoload.php';

Config::loadConfigs();

$rpc = new RPC(
    Relay::create(Config::get('rpc.connection'))
);

$metrics = new Metrics($rpc);

function queueStatusMetrics(RPCInterface $rpc, Metrics $metrics): void
{
    $collectorType = CollectorType::Gauge;
    foreach (((array)$rpc->call('jobs.Stat', null))['stats'] as $queue) {
        $metrics->declare($collectorType->value . '_' . $queue['queue'], Collector::gauge());
        $metrics->set($collectorType->value . '_' . $queue['queue'], $queue['active'] ?? 0);
    }
}

queueStatusMetrics($rpc, $metrics);
