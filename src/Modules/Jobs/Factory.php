<?php

namespace App\Modules\Jobs;

use Core\Config;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Jobs\Jobs;
use Spiral\RoadRunner\Jobs\JobsInterface;
use Spiral\RoadRunner\Jobs\QueueInterface;

class Factory implements FactoryInterface
{
    public function createQueue(string $queueName, ?string $rpcConnection = null): QueueInterface
    {
        return static::createJobs($rpcConnection)->connect($queueName);
    }

    public function createJobs(?string $rpcConnection = null): JobsInterface
    {
        return new Jobs(RPC::create($rpcConnection ?? Config::get("rpc.connection")));
    }
}
