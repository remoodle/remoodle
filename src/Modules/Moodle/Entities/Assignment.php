<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

class Assignment
{
    /**
     * @param int $assignment_id
     * @param int $course_id
     * @param string $name - name
     * @param bool $nosubmissions - does that assignment require submission
     * @param int $duedate
     * @param int $allowsubmissionsfromdate
     * @param int $grade - max grade(not percentage)
     * @param IntroAttachment[] $introattachments - array of IntroAttachment
     */
    public function __construct(
        public readonly int $assignment_id,
        public readonly int $course_id,
        public readonly string $name,
        public readonly bool $nosubmissions,
        public readonly int $duedate,
        public readonly int $allowsubmissionsfromdate,
        public readonly int $grade,
        public readonly array $introattachments
    ) {
    }
}
