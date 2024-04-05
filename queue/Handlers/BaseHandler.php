<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Psr\Container\ContainerInterface;
use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

abstract class BaseHandler implements HandlerInterface
{
    protected function container(): ContainerInterface
    {
        return $this->container;
    }

    protected function get(string $id): mixed
    {
        return $this->container->get($id);
    }

    public function __construct(
        protected ReceivedTaskInterface $receivedTask,
        protected ContainerInterface $container
    ) {
        $this->setup();
    }

    protected function setup(): void
    {
        //setup class
    }

    public function handle(): void
    {
        //job hanlde code here
    }
}
