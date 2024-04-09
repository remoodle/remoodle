<?php

declare(strict_types=1);

namespace Queue\Handlers;

use Spiral\RoadRunner\KeyValue\Factory;

class InitializeUser extends BaseHandler
{
    private Factory $factory;

    protected function setup(): void
    {
        $this->factory = $this->get(Factory::class);
    }

    protected function dispatch(): void
    {
        /**
         * @var \App\Models\MoodleUser
         */
        $user = $this->getPayload()->payload();
        $user->update([
            'initialized' => true
        ]);
        $this
            ->factory
            ->select('users')
            ->set($user->moodle_token, $user->withoutRelations());
    }

}
