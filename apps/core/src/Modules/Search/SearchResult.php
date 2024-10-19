<?php

declare(strict_types=1);

namespace App\Modules\Search;

class SearchResult
{
    public function __construct(
        public readonly string $idValue,
        public readonly string $idColunm,
        public readonly float $score,
        public readonly string $type,
        public ?object $related = null
    ) {
    }
}
