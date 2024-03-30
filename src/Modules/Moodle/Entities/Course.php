<?php

namespace App\Modules\Moodle\Entities;

class Course
{
    /**
     * @param int $course_id
     * @param string $coursename
     * @param string $coursecategory
     * @param int $start_date
     * @param int $end_date
     * @param string $url
     */
    public function __construct(
        public readonly int $course_id,
        public readonly string $name,
        public readonly string $coursecategory,
        public readonly int $start_date,
        public readonly int $end_date,
        public readonly string $url,
    ) {
    }
}
