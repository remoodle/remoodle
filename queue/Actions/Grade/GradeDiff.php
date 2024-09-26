<?php

declare(strict_types=1);

namespace Queue\Actions\Grade;

final class GradeDiff
{
    public function __construct(
        public readonly string $gradeName,
        public readonly ?float $old,
        public readonly ?float $new,
    ) {
    }

    public function toArray(): array
    {
        return [
            $this->gradeName,
            $this->old,
            $this->new
        ];
    }
}
