<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

class CourseModule
{
    /**
     * @param int $cmid
     * @param int $course_id
     */
    public function __construct(
        public readonly int $cmid,
        public readonly int $course_id,
    ) {
    }
}
