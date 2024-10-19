<?php

declare(strict_types=1);

namespace App\Modules\Search;

interface SearchableInterface
{
    /**
     * @return string[]
     */
    public function getWords(): array;

    /**
     * @return string
     */
    public function getIdColumn(): string;

    /**
     * @return string
     */
    public function getIdValue(): string;

    /**
     * @return string
     */
    public function getUniqueIdentifier(): string;

    /**
     * @return string
     */
    public function getType(): string;

    /**
     * @return null|int
     */
    public function getCourseId(): ?int;

    /**
     * @return null|int
     */
    public function getMoodleId(): ?int;
}
