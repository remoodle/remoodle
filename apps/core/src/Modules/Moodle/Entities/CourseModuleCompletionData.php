<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

class CourseModuleCompletionData
{
    /**
     * @param int $cmid
     * @param int $state
     * @param int $timecompleted
     * @param bool $valueused
     * @param bool $hascompletion
     * @param bool $isautomatic
     * @param bool $istrackeduser
     * @param bool $uservisible
     * @param ?string $overrideby
     */
    public function __construct(
        public readonly int $cmid,
        public readonly int $state,
        public readonly int $timecompleted,
        public readonly bool $valueused,
        public readonly bool $hascompletion,
        public readonly bool $isautomatic,
        public readonly bool $istrackeduser,
        public readonly bool $uservisible,
        public readonly ?string $overrideby = null,
    ) {
    }

    public function hash(): string
    {
        return hash("sha256", $this->cmid . $this->state . $this->timecompleted . $this->valueused . $this->hascompletion . $this->uservisible);
    }
}
