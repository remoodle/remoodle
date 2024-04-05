<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Psr\Container\ContainerInterface;
use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

interface HandlerInterface
{
    public static function create(ReceivedTaskInterface $receivedTask, ContainerInterface $container): static;
    public function handle(): void;
}
