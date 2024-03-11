<?php

namespace App\Modules\Moodle;

class BaseMoodleUser
{
    public function __construct(
        public readonly string $token,
        public readonly string $barcode,
        public readonly string $name,
        public readonly int $moodleId
    ){}
}