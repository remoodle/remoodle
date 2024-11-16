<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Core\Config;
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
