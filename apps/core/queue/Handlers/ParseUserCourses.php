<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Illuminate\Database\Connection;
use App\Modules\Search\SearchEngineInterface;
use Core\Config;
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
