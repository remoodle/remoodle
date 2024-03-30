<?php

namespace Queue\HandlerFactory;

use Core\Config;
use Queue\Handlers\HandlerInterface;
use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

class Factory
{
    public function createHandler(ReceivedTaskInterface $receivedTask): ?HandlerInterface
    {
        $class = Config::get("queue.handlers.".$receivedTask->getPipeline(), null);

        if($class === null) {
            return null;
        }

        if(class_exists($class)) {
            return new $class($receivedTask);
        }

        return null;
    }
}
