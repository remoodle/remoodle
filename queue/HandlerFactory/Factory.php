<?php

namespace Queue\HandlerFactory;

use Queue\Handlers\HandlerInterface;
use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

class Factory
{
    public function __construct(
        // private Config $config,
    ){}

    public function createHandler(ReceivedTaskInterface $receivedTask): ?HandlerInterface
    {
        // $class = $this->config->get("queue.handlers." . $receivedTask->getQueue(), null);
        // if($class === null){
        //     return null;
        // }

        // if(class_exists($class)){
        //     return new $class($receivedTask);
        // }

        return null;
    }
}