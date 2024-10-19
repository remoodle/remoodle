<?php

declare(strict_types=1);

namespace App\Modules\Search;

interface LemmetizationInterface
{
    /**
     * @param string $word
     * @return string
     */
    public function get(string $word): string;

    /**
     * @param string[] $words
     * @return string[]
     */
    public function getKeywords(array $words): array;
}
