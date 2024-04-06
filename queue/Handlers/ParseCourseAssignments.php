<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Moodle\Moodle;
use Illuminate\Database\Connection;

class ParseUserEvents extends BaseHandler
{
    private Connection $connection;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
    }

    protected function dispatch(): void
    {
        /**
         * @var \App\Modules\Moodle\Entities\Course
         */
        $user = $this->getPayload()->payload();
        // $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);

        // $this->connection->table("events")->upsert($userApiEvents, ["event_id"]);
    }
}
