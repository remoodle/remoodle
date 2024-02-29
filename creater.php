<?php

use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\Task\Task;

require 'vendor/autoload.php';


$jobs = new Jobs(
    RPC::create('tcp://127.0.0.1:6001')
);
$queue = $jobs->connect('user_registered');
$task = $queue->create(Task::class, serialize((new stdClass())));
$queue->dispatch($task);