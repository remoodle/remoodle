<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

use Spatie\Cloneable\Cloneable;

class UserAssignmentSubmission
{
    use Cloneable;
    public function __construct(
        public readonly int $assignment_id,
        public readonly bool $submissionsenabled,
        public readonly bool $graded,
        public readonly bool $cansubmit,
        public readonly bool $submitted = false,
        public readonly ?int $submission_id = null,
        public readonly ?int $timecreated = null,
        public readonly ?int $timemodified = null,
        public readonly ?int $extensionduedate = null,
    ) {
    }
}
