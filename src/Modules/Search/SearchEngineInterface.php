<?php

declare(strict_types=1);

namespace App\Modules\Search;

interface SearchEngineInterface
{
    /**
     * @param int $moodleId
     * @return SearchEngineInterface
     */
    public function withMoodleId(int $moodleId): static;

    /**
     * @param string $query
     * @param int $limit
     * @return SearchResult[]
     */
    public function search(string $query, int $limit): array;

    /**
     * @param SearchableInterface $searchItem
     * @return void
     */
    public function put(SearchableInterface $searchItem): void;

    /**
     * @param SearchableInterface[] $searchItems
     * @return void
     */
    public function putMany(array $searchItems): void;
}
