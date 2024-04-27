<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

use Spatie\Cloneable\Cloneable;

class CourseModule
{
    use Cloneable;

    /**
     * Summary of __construct
     * @param int $cmid
     * @param int $contentId
     * @param int $instance
     * @param int $contextid
     * @param int $course_id
     * @param string $modname
     * @param string $modplural
     * @param bool $noviewlink
     * @param int $visibleoncoursepage
     * @param bool $uservisible
     * @param string $url
     * @param int $completion
     * @param null|CourseModuleCompletionData $completionData
     * @param null|CourseModuleDate[] $dates
     * @param null|CourseModuleAttachment[] $contents
     */
    public function __construct(
        public readonly int $cmid,
        public readonly int $contentId,
        public readonly int $instance,
        public readonly int $contextid,
        public readonly int $course_id,
        public readonly string $modname,
        public readonly string $modplural,
        public readonly bool $noviewlink,
        public readonly int $visibleoncoursepage,
        public readonly bool $uservisible,
        public readonly string $url,
        public readonly int $completion,
        public readonly string $description,
        public readonly string $modicon,
        public readonly string $name,
        public readonly ?CourseModuleCompletionData $completionData = null,
        public readonly ?array $dates = null,
        public readonly ?array $contents = null
    ) {
    }
}
