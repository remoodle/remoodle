<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

use App\Modules\Moodle\Entities\Search\SearchTypeEnum;
use App\Modules\Search\SearchableInterface;

class Event implements SearchableInterface
{
    /**
     * @param int $event_id
     * @param int $timestart
     * @param int $instance
     * @param string $name
     * @param bool $visible
     * @param int $course_id
     * @param string $course_name
     */
    public function __construct(
        public readonly int $event_id,
        public readonly int $timestart,
        public readonly int $instance,
        public readonly string $name,
        public readonly bool $visible,
        public readonly int $course_id,
        public readonly string $course_name,
        public readonly ?Assignment $assignment = null
    ) {
    }

    /**
     * @param null|Assignment $assignment
     * @return Event
     */
    public function withAssignment(?Assignment $assignment): static
    {
        return new static(
            event_id: $this->event_id,
            timestart: $this->timestart,
            instance: $this->instance,
            name: $this->name,
            visible: $this->visible,
            course_id: $this->course_id,
            course_name: $this->course_name,
            assignment: $assignment
        );
    }

    /**
     * @return string[]
     */
    public function getWords(): array
    {
        return explode(" ", 'event deadline '.trim($this->name . " " . $this->course_name));
    }

    /**
     * @return string
     */
    public function getIdColumn(): string
    {
        return "event_id";
    }

    /**
     * @return string
     */
    public function getIdValue(): string
    {
        return (string)$this->event_id;
    }

    /**
     * @return string
     */
    public function getUniqueIdentifier(): string
    {
        return "event_id" . " | " . $this->event_id;
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return SearchTypeEnum::EVENT->value;
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
