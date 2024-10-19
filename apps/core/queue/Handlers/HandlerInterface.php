<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Jobs\FactoryInterface;
use Psr\Container\ContainerInterface;
use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

interface HandlerInterface
{
    /**
     * @param \Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface $receivedTask
     * @param \Psr\Container\ContainerInterface $container
     * @param \App\Modules\Jobs\FactoryInterface $jobsFactory
     * @return static
     */
    public static function create(ReceivedTaskInterface $receivedTask, ContainerInterface $container, FactoryInterface $jobsFactory): static;
    public function handle(): void;
}
