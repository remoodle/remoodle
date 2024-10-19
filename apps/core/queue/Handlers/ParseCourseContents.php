<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Illuminate\Database\Connection;
use Queue\Actions\ParseCourseContents as ActionsParseCourseContents;

class ParseCourseContents extends BaseHandler
{
    private ActionsParseCourseContents $action;

    protected function setup(): void
    {
        $connection = $this->get(Connection::class);
        $user = $this->getPayload()->payload();

        $this->action = new ActionsParseCourseContents($user, $connection);
    }

    protected function dispatch(): void
    {
        ($this->action)();
    }
}
