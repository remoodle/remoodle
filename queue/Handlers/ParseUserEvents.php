<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Moodle\Entities\Event;
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
        /**@var \App\Models\MoodleUser */
        $user = $this->getPayload()->payload();
        $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);
        $userApiEvents = array_map(fn (Event $event) => (array)$event, $moodle->getDeadlines());

        $this->connection->table("events")->upsert($userApiEvents, ["event_id"]);
    }
}
