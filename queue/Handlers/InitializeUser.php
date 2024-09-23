<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Modules\Search\SearchEngineInterface;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Core\Config;
use Illuminate\Database\Connection;
use Queue\Actions\ParseCourseContents;
use Queue\Actions\ParseUserAssignments;
use Queue\Actions\ParseUserCourses;
use Queue\Actions\ParseUserEvents;
use Queue\Actions\ParseUserGrades;
use Spiral\RoadRunner\KeyValue\Factory;

class InitializeUser extends BaseHandler
{
    private Factory $factory;
    private ParseUserCourses $parseUserCourses;
    private ParseCourseContents $parserCourseContents;
    private ParseUserGrades $parseUserGrades;
    private ParseUserEvents $parseUserEvents;
    private ParseUserAssignments $parseUserAssignments;

    protected function setup(): void
    {
        $this->factory = $this->get(Factory::class);
        $connection = $this->get(Connection::class);
        $user = $this->getPayload()->payload();
        $searchEngine = $this->get(SearchEngineInterface::class);
        $moodleWebservicesUrl = Config::get("moodle.webservice_url");

        $this->parseUserCourses = new ParseUserCourses($connection, $searchEngine, $user);
        $this->parserCourseContents = new ParseCourseContents($user, $connection);
        $this->parseUserGrades = new ParseUserGrades($connection, $user, $moodleWebservicesUrl);
        $this->parseUserEvents = new ParseUserEvents($connection, $searchEngine, $user);
        $this->parseUserAssignments = new ParseUserAssignments($user, $connection, $searchEngine);
    }

    protected function dispatch(): void
    {
        $this->parseUserCourses->__invoke();
        $this->parserCourseContents->__invoke();
        $this->parseUserGrades->__invoke();
        $this->parseUserEvents->__invoke();
        $this->parseUserAssignments->__invoke();

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
        $this
            ->factory
            ->select('users')
            ->set('m'.$user->moodle_id, $user->moodle_token);
        echo "Initialization success for {$user->moodle_id}({$user->username})\n";
    }

}
