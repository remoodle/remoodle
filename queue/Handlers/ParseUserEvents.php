<?php

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Modules\Moodle\Entities\Event;
use App\Modules\Moodle\Moodle;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Connection;

class ParseUserEvents extends BaseHandler
{
    private Moodle $moodle;
    private Connection $connection;
    private MoodleUser $user;

    public function handle(): void
    {
        /**@var \App\Models\MoodleUser */
        $this->user = new MoodleUser(json_decode($this->receivedTask->getPayload(), 1));
        $this->moodle = Moodle::createFromToken($this->user->moodle_token, $this->user->moodle_id);
        $this->connection = Manager::connection();
        $userApiEvents = array_map(fn (Event $event) => (array)$event, $this->moodle->getDeadlines());
        $this->connection->table("events")->upsert($userApiEvents, ["event_id"]);
        $this->receivedTask->complete();
    }
}
