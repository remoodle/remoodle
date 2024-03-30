<?php

namespace App\Modules\Jobs;

use Spiral\RoadRunner\Jobs\JobsInterface;
use Spiral\RoadRunner\Jobs\QueueInterface;

interface FactoryInterface
{
    public function createQueue(string $queueName, ?string $rpcConnection = null): QueueInterface;
    public function createJobs(?string $rpcConnection = null): JobsInterface;
}
