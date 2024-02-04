<?php

namespace App\Services;

use App\Modules\Moodle\Traits\RetrieveUser;
use App\Services\RemoodleServiceInterface;

class RemoodleTelegramBot implements RemoodleServiceInterface
{
    use RetrieveUser;

    public function notifyUser(int $moodleId, string $message): void
    {}

}