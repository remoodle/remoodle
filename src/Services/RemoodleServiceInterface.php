<?php

namespace App\Services;

use App\Models\MoodleUser;
use App\Modules\Moodle\BaseMoodleUser;

interface RemoodleServiceInterface
{
    /**
     * Service implementation for user retrievement
     * @param string $token - Moodle api's token
     * @return BaseMoodleUser - Base moodle user class
     */
    public function retrieveUser(string $token): BaseMoodleUser;

    /**
     * Service implementation for user notification
     * @param int $moodleId - id of user in moodle system
     */
    public function notifyUser(int $moodleId, string $message): void; 
}