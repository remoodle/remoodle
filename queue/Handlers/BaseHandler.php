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

    /**
    * @template T
    * @param class-string<T> $id
    * @throws \Psr\Container\NotFoundExceptionInterface
    * @throws \Psr\Container\ContainerExceptionInterface
    * @return T
    */
    protected function get(string $id): mixed
    {
        return $this->container->get($id);
    }

    /**
     * @param \Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface $receivedTask
     * @param \Psr\Container\ContainerInterface $container
     */
    protected function __construct(
        protected ReceivedTaskInterface $receivedTask,
        protected ContainerInterface $container,
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

    public static function create(ReceivedTaskInterface $receivedTask, ContainerInterface $container): static
    {
        return new static($receivedTask, $container);
    }
}
