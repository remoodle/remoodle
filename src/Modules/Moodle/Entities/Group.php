<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

class Group
{
    public function __construct(
        public readonly int $id,
        public readonly int $course_id,
        public readonly int $descriptionformat,
        public readonly string $idnumber,
        public readonly string $name,
        public readonly string $description,
    ) {
    }

}
