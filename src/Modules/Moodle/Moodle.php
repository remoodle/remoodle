<?php

namespace App\Modules\Moodle;

use Core\Config;
use Fugikzl\MoodleWrapper\Moodle as MoodleWrapperMoodle;

final class Moodle
{
    public static function constructMoodleWrapper(string $token, ?int $moodleUserId = null)
    {
        return new MoodleWrapperMoodle(Config::get("moodle.webservice_url"), $token, $moodleUserId);
    }

    public static function createFromToken(string $token)
    {
        return new static(static::constructMoodleWrapper($token), $token);
    }
    
    public static function getBarcodeFromUsername(string $username)
    {
        return explode("@", $username)[0];
    }

    public function __construct(
        private MoodleWrapperMoodle $moodleWrapper,
        private string $token
    ){}

    /**
     * @return 
     */
    public function getUser(): BaseMoodleUser
    {
        $res = $this->moodleWrapper->getUserInfo();

        return new BaseMoodleUser(
            $this->token,
            static::getBarcodeFromUsername($res["username"]),
            $res["fullname"],
            $res["userid"]
        );
    }
    

}