<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Illuminate\Database\Connection;
use App\Modules\Search\SearchEngineInterface;
use Queue\Actions\ParseUserCourses as ActionsParseUserCourses;

class ParseUserCourses extends BaseHandler
{
    private ActionsParseUserCourses $action;

    protected function setup(): void
    {
        $connection = $this->get(Connection::class);
        $searchEngine = $this->get(SearchEngineInterface::class);

        $this->action = new ActionsParseUserCourses($connection, $searchEngine, $this->getPayload()->payload());
    }

    protected function dispatch(): void
    {
        ($this->action)();
    }

}
