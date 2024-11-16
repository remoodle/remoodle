<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Jobs\Factory;
use App\Modules\Jobs\FactoryInterface;
use Illuminate\Database\QueryException;
use Psr\Container\ContainerInterface;
use Queue\Payload\PayloadInterface;
use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;
use Spiral\RoadRunner\Jobs\Task\Task;

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

    protected PayloadInterface $payload;
    protected string $queue;

    /**
     * @param \Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface $receivedTask
     * @param \Psr\Container\ContainerInterface $container
     */
    protected function __construct(
        protected ReceivedTaskInterface $receivedTask,
        protected ContainerInterface $container,
        protected FactoryInterface $jobsFactory
    ) {
        $this->payload = igbinary_unserialize($this->receivedTask->getPayload());
        $this->queue = $receivedTask->getPipeline() ?? $receivedTask->getQueue();
        $this->setup();
    }

    protected function setup(): void
    {
        //setup class
    }

    protected function getPayload(): PayloadInterface
    {
        return $this->payload;
    }

    protected function dispatch(): void
    {

    }

    protected function after(): void
    {

    }

    protected function handleBus(): void
    {
        $payload = $this->getPayload();
        $next = $payload->next();

        if ($next === null) {
            return;
        }

        $bus = $payload->bus();
        $headPayload = array_shift($bus);
        foreach ($bus as $busPayload) {
            $headPayload->add($busPayload);
        }

        $queue = $this->jobsFactory->createQueue($headPayload->queue());
        $queue->dispatch(
            $queue->create(
                name: Task::class,
                payload: $headPayload
            )
        );
    }

    public function handle(): void
    {
        try {
            $this->dispatch();

            if ($this->getPayload()->next() === null) {
                $this->after();
            }
        } catch (QueryException $e) {
            if ((int)$e->getCode() === 40001 || (int)$e->getCode() === 1213) {
                $this->receivedTask->fail('DEADLOCK!!! - restarting', true);
            } else {
                $this->receivedTask->fail($e);
            }
        } catch (\Throwable $th) {
            $this->receivedTask->fail($th);
        }

        try {
            $this->handleBus();
            $this->receivedTask->complete();
        } catch (QueryException $e) {
            if ($e->getCode() === 40001 || $e->getCode() === 1213) {
                $this->receivedTask->fail('DEADLOCK!!! - restarting', true);
            } else {
                $this->receivedTask->fail($e);
            }
        } catch (\Throwable $th) {
            $this->receivedTask->fail($th);
        }
    }

    public static function create(ReceivedTaskInterface $receivedTask, ContainerInterface $container, FactoryInterface $jobsFactory): static
    {
        return new static($receivedTask, $container, $jobsFactory);
    }
}
