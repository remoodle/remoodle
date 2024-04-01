<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

interface HandlerInterface
{
    public function __construct(ReceivedTaskInterface $receivedTask);
    public function handle(): void;
}
