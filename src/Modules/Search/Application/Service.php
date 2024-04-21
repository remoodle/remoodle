<?php

declare(strict_types=1);

namespace App\Modules\Search\Application;

use App\Modules\Moodle\Entities\Search\SearchTypeEnum;
use App\Modules\Search\SearchEngineInterface;

class Service
{
    public function __construct(
        private SearchEngineInterface $searchEngine
    ) {
    }

    public function search(string $query, int $limit = 10): array
    {
        return [];
    }
}
