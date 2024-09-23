<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Moodle\Moodle;
use App\Modules\Search\SearchEngineInterface;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Illuminate\Database\Connection;
use Queue\Actions\ParseUserAssignments as ActionsParseUserAssignments;

class ParseUserAssignments extends BaseHandler
{
    private ActionsParseUserAssignments $action;

    protected function setup(): void
    {
        $connection = $this->get(Connection::class);
        $searchEngine = $this->get(SearchEngineInterface::class);
        $user = $this->getPayload()->payload();

        $this->action = new ActionsParseUserAssignments($user, $connection, $searchEngine);
    }

    protected function dispatch(): void
    {
        ($this->action)();
    }
}
