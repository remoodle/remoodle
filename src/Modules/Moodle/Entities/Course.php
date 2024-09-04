<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

use App\Modules\Moodle\Entities\Search\SearchTypeEnum;
use App\Modules\Search\SearchableInterface;

class Course implements SearchableInterface
{
    /**
     * @param int $course_id
     * @param string $coursename
     * @param string $coursecategory
     * @param int $start_date
     * @param int $end_date
     * @param string $url
     * @param string $status
     */
    public function __construct(
        public readonly int $course_id,
        public readonly string $name,
        public readonly string $coursecategory,
        public readonly int $start_date,
        public readonly int $end_date,
        public readonly string $url,
        public readonly string $status
    ) {
    }

    /**
     * @return string[]
     */
    public function getWords(): array
    {
        return explode(" ", 'course ' . trim($this->name));
    }

    /**
     * @return string
     */
    public function getIdColumn(): string
    {
        return "course_id";
    }

    /**
     * @return string
     */
    public function getIdValue(): string
    {
        return (string) $this->course_id;
    }

    /**
     * @return string
     */
    public function getUniqueIdentifier(): string
    {
        return "course_id" . " | " . $this->course_id;
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return SearchTypeEnum::COURSE->value;
    }

    public function getCourseId(): ?int
    {
        return $this->course_id;
    }

    public function getMoodleId(): ?int
    {
        return null;
    }
}
