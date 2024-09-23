<?php

declare(strict_types=1);

namespace Queue\Actions\Batch\Events;

final class EventsBatchDto
{
    public function __construct(
        public readonly string $moodleToken,
        public readonly int $moodleId
    ) {
    }
}
