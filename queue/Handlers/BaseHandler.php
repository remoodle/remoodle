<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

abstract class BaseHandler implements HandlerInterface
{
    protected ReceivedTaskInterface $receivedTask;

    public function __construct(ReceivedTaskInterface $receivedTask)
    {
        $this->receivedTask = $receivedTask;
    }

    public function handle(): void
    {

    }
}
