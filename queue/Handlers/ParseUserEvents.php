<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Moodle\Entities\Event;
use App\Modules\Moodle\Moodle;
use App\Modules\Search\SearchEngineInterface;
use Illuminate\Database\Connection;

class ParseUserEvents extends BaseHandler
{
    private Connection $connection;
    private SearchEngineInterface $searchEngine;

    protected function setup(): void
    {
        $this->connection = $this->get(Connection::class);
        $this->searchEngine = $this->get(SearchEngineInterface::class);
    }

    protected function dispatch(): void
    {
        /**@var \App\Models\MoodleUser */
        $user = $this->getPayload()->payload();
        $moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);
        $userApiEvents = $moodle->getDeadlines();

        $this->connection->beginTransaction();

        try {
            $this->connection->table("events")->upsert(array_map(function (Event $event) {
                $event = (array)$event;
                unset($event['assignment']);
                return $event;
            }, $userApiEvents), ["instance"]);
            $this->connection->commit();
        } catch (\Throwable $th) {
            $this->connection->rollBack();
            throw $th;
        }

        $this->searchEngine->putMany($userApiEvents);
    }
}
