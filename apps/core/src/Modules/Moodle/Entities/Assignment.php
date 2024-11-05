<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

use App\Modules\Moodle\Entities\Search\SearchTypeEnum;
use App\Modules\Search\SearchableInterface;

class Assignment implements SearchableInterface
{
    /**
     * @param int $assignment_id
     * @param int $course_id
     * @param int $cmid
     * @param string $name - name
     * @param bool $nosubmissions - does that assignment require submission
     * @param int $duedate
     * @param int $allowsubmissionsfromdate
     * @param int $grade - max grade(not percentage)
     * @param IntroAttachment[] $introattachments - array of IntroAttachment
     */
    public function __construct(
        public readonly int $assignment_id,
        public readonly int $course_id,
        public readonly int $cmid,
        public readonly string $name,
        public readonly bool $nosubmissions,
        public readonly int $duedate,
        public readonly int $allowsubmissionsfromdate,
        public readonly int $grade,
        public readonly array $introattachments,
        public readonly int $introformat,
        public readonly ?string $intro = null,
        public readonly ?Grade $gradeEntity = null,
        public readonly ?UserAssignmentSubmission $submissionEntity = null,
    ) {
    }

    public function withGrade(?Grade $grade): static
    {
        return new static(
            assignment_id: $this->assignment_id,
            course_id: $this->course_id,
            cmid: $this->cmid,
            name: $this->name,
            nosubmissions: $this->nosubmissions,
            duedate: $this->duedate,
            allowsubmissionsfromdate: $this->allowsubmissionsfromdate,
            grade: $this->grade,
            introattachments: $this->introattachments,
            intro: $this->intro,
            introformat: $this->introformat,
            gradeEntity: $grade,
            submissionEntity: $this->submissionEntity
        );
    }

    /**
     * @return string[]
     */
    public function getWords(): array
    {
        return  explode(" ", trim('assignment ' . $this->name . " " . implode(" ", array_map(function (IntroAttachment $introAttachment) {
            return $introAttachment->filename;
        }, $this->introattachments))));
    }

    /**
     * @return string
     */
    public function getIdColumn(): string
    {
        return "assignment_id";
    }

    /**
     * @return string
     */
    public function getIdValue(): string
    {
        return (string)$this->assignment_id;
    }

    /**
     * @return string
     */
    public function getUniqueIdentifier(): string
    {
        return "assignment_id" . " | " . $this->assignment_id;
    }

    public function getType(): string
    {
        return SearchTypeEnum::ASSIGNMENT->value;
    }

    public function getCourseId(): ?int
    {
        return $this->course_id;
    }

    public function getMoodleId(): ?int
    {
        return null;
    }
}
