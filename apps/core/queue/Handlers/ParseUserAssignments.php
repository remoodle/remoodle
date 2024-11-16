<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Moodle\Moodle;
use App\Modules\Search\SearchEngineInterface;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Core\Config;
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

    protected function after(): void
    {
        $user = $this->getPayload()->payload();
        $queueStorage = (new \Spiral\RoadRunner\KeyValue\Factory(
            \Spiral\Goridge\RPC\RPC::create(Config::get("rpc.connection"))
        ))->withSerializer(new \Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer())->select('queue');

        if (($queueStorage->get($this->queue . $user->moodle_id, true))) {
            $queueStorage->set($this->queue . $user->moodle_id, false);
            echo '[LOCK] released ' . $user->moodle_id . ' parse course contents' . "\n";
        }
    }

    protected function dispatch(): void
    {
        ($this->action)();
    }
}
