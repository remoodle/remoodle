<?php

declare(strict_types=1);

namespace App\Modules\Moodle;

class BaseMoodleUser
{
    public function __construct(
        public readonly string $token,
        public readonly string $username,
        public readonly string $name,
        public readonly int $moodleId
    ) {
    }
}
