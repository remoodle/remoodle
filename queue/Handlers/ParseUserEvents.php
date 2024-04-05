<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Modules\Moodle\Entities\Event;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Connection;

class ParseUserEvents extends BaseHandler
{
    private Connection $connection;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
    }

    public function handle(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = new MoodleUser(json_decode($this->receivedTask->getPayload(), true));
        $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);
        $userApiEvents = array_map(fn (Event $event) => (array)$event, $moodle->getDeadlines());

        $this->connection->table("events")->upsert($userApiEvents, ["event_id"]);
        $this->receivedTask->complete();
    }
}
