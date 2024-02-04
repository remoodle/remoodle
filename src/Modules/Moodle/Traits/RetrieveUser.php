<?php

namespace App\Modules\Moodle\Traits;

use App\Modules\Moodle\BaseMoodleUser;
use App\Modules\Moodle\Moodle;

trait RetrieveUser
{
    public function retrieveUser(string $token): BaseMoodleUser
    {
        $moodle = Moodle::createFromToken($token);
        return $moodle->getUser();
    }
}