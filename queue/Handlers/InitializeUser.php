<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Spiral\RoadRunner\KeyValue\Factory;

class InitializeUser extends BaseHandler
{
    private Factory $factory;
    // private DatabaseUserMoodleRepositoryInterface $databaseRepository;

    protected function setup(): void
    {
        $this->factory = $this->get(Factory::class);
        // $this->databaseRepository = $this->get(DatabaseUserMoodleRepositoryInterface::class);
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
