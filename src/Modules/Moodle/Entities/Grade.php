<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

use App\Modules\Moodle\Entities\Search\SearchTypeEnum;
use App\Modules\Search\SearchableInterface;

class Grade implements SearchableInterface
{
    public function __construct(
        public readonly int $grade_id,
        public readonly string $name,
        public readonly int $moodle_id,
        public readonly string $itemtype,
        public readonly int $grademin,
        public readonly int $grademax,
        public readonly int $feedbackformat,
        public readonly ?string $itemmodule = null,
        public readonly ?int $iteminstance = null,
        public readonly ?int $cmid = null,
        public readonly ?float $graderaw = null,
        public readonly ?string $feedback = null,
        public readonly ?int $percentage = null,
    ) {
    }

    /**
     * @return string[]
     */
    public function getWords(): array
    {
        return explode(" ", 'grade ' . trim($this->name));
    }

    /**
     * @return string
     */
    public function getIdColumn(): string
    {
        return "moodle_id-grade_id";
    }

    /**
     * @return string
     */
    public function getIdValue(): string
    {
        return (string)$this->moodle_id."-".(string)$this->grade_id;
    }

    /**
     * @return string
     */
    public function getUniqueIdentifier(): string
    {
        return "grade_id" . " | " . $this->grade_id;
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return SearchTypeEnum::GRADE->value;
    }

    public function getCourseId(): ?int
    {
        return null;
    }

    public function getMoodleId(): ?int
    {
        return $this->moodle_id;
    }
}
