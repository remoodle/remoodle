<?php

namespace Queue\Handlers\UserGrades;

use Queue\Handlers\BaseHandler;
use Spiral\RoadRunner\Jobs\Task\ReceivedTaskInterface;

class UserGradesSubscription extends BaseHandler
{
    public function __construct(ReceivedTaskInterface $receivedTask)
    {
        parent::__construct($receivedTask);
    }

    public function handle(): void
    {
        $taskId = $this->receivedTask->getId();
        $this->receivedTask->complete();
        echo("\n task $taskId is completed!!\n");
    }
}