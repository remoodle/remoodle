<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

class Grade
{
    public function __construct(
        public readonly int $course_id,
        public readonly int $grade_id,
        public readonly ?int $cmid,
        public readonly string $name,
        public readonly ?int $percentage,
        public readonly int $moodle_id,
        public readonly string $itemtype
    ) {
    }
}
