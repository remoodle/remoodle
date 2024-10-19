<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Moodle\Entities\Event;
use App\Modules\Moodle\Moodle;
use App\Modules\Search\SearchEngineInterface;
use Illuminate\Database\Connection;
use Queue\Actions\ParseUserEvents as ActionsParseUserEvents;

class ParseUserEvents extends BaseHandler
{
    private ActionsParseUserEvents $action;

    protected function setup(): void
    {
        $connection = $this->get(Connection::class);
        $searchEngine = $this->get(SearchEngineInterface::class);
        $user = $this->getPayload()->payload();

        $this->action = new ActionsParseUserEvents($connection, $searchEngine, $user);
    }

    protected function dispatch(): void
    {
        $this->action->__invoke();
    }
}
