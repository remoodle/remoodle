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
        $this->action = new ActionsParseUserGrades(
            $connection,
            $user,
            $moodleWebservicesUrl,
            Config::get("webhook.url"),
            Config::get("webhook.secret"),
            Config::get("webhook.enabled"),
        );
    }

    protected function after(): void
    {
        $user = $this->getPayload()->payload();
        $queueStorage = (new \Spiral\RoadRunner\KeyValue\Factory(
            \Spiral\Goridge\RPC\RPC::create(Config::get("rpc.connection"))
        ))->withSerializer(new \Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer())->select('queue');

        if (boolval($queueStorage->get($this->queue . $user->moodle_id, true)) === true) {
            $queueStorage->set($this->queue . $user->moodle_id, false, 3600);
            echo '[LOCK] released ' . $user->moodle_id . ' parse course contents' . "\n";
        }
    }

    protected function dispatch(): void
    {
        ($this->action)();
    }
}
