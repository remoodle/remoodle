<?php

declare(strict_types=1);

namespace Queue\Actions\Grade;

final class GradeChangePayload
{
    /**
     * @param int $moodleId
     * @param CourseGradeDiff[] $payload
     */
    public function __construct(
        public readonly int $moodleId,
        public readonly array $payload
    ) {
    }

    public function toArray(): array
    {
        return [
            'moodleId' => $this->moodleId,
            'payload' => array_map(
                fn (CourseGradeDiff $cgd): array => $cgd->toArray(),
                $this->payload
            )
        ];
    }
}
