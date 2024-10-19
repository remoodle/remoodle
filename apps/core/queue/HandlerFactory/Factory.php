<?php

declare(strict_types=1);

namespace Queue\HandlerFactory;

use App\Modules\Jobs\FactoryInterface;
use Core\Config;
use Psr\Container\ContainerInterface;
use Queue\Handlers\HandlerInterface;
use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

class Factory
{
    public function createHandler(ReceivedTaskInterface $receivedTask, ContainerInterface $container): ?HandlerInterface
    {
        /**var class-string<\Queue\Handlers\HandlerInterface> */
        $class = Config::get("queue.handlers.".$receivedTask->getPipeline(), null);

        if($class === null) {
            return null;
        }

        if(class_exists($class)) {
            return call_user_func_array(array($class, "create"), [
                'container' => $container,
                'receivedTask' => $receivedTask,
                'jobsFactory' => $container->get(FactoryInterface::class)
            ]);
        }

        return null;
    }
}
