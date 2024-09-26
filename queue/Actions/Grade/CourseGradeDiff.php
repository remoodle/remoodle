<?php

declare(strict_types=1);

namespace Queue\Actions\Grade;

final class CourseGradeDiff
{
    /**
     * @param string $course
     * @param GradeDiff[] $grades
     */
    public function __construct(
        public readonly string $course,
        public readonly array $grades
    ) {
    }

    public function toArray(): array
    {
        return [
            'course' => $this->course,
            'grades' => array_map(
                fn (GradeDiff $gf): array => $gf->toArray(),
                $this->grades
            )
        ];
    }
}
