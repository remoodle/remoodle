<?php

namespace Queue\Handlers;

use Core\Config;
use Illuminate\Database\Connection;
use Queue\Handlers\BaseHandler;
use Queue\Actions\ParseUserEventsBatch as Action;

final class ParseUserEventsBatch extends BaseHandler
{
    private Action $action;

    protected function setup(): void
    {
        $connection = $this->get(Connection::class);
        $this->action = new Action($this->getPayload()->payload(), $connection, Config::get("moodle.webservice_url"));
    }

    protected function dispatch(): void
    {
        $this->action->__invoke();
    }
}
