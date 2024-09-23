<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Core\Config;
use Illuminate\Database\Connection;
use Queue\Actions\ParseUserGrades as ActionsParseUserGrades;

class ParseUserGrades extends BaseHandler
{
    private ActionsParseUserGrades $action;

    protected function setup(): void
    {
        $connection = $this->get(Connection::class);
        $user = $this->getPayload()->payload();
        $moodleWebservicesUrl = Config::get("moodle.webservice_url");
        $this->action = new ActionsParseUserGrades($connection, $user, $moodleWebservicesUrl);
    }

    protected function dispatch(): void
    {
        ($this->action)();
    }
}
