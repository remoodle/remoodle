<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\Entities\Assignment as EntitiesAssignment;
use App\Modules\Moodle\Entities\IntroAttachment;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $assignment_id
 * @property int $course_id
 * @property int $cmid
 * @property string $name
 * @property bool $nosubmissions
 * @property int $duedate
 * @property int $allowsubmissionsfromdate
 * @property int $grade
 * @property int $introformat
 * @property ?string $intro
 */
class Assignment extends ModelAbstract
{
    public $timestamps = false;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'assignment_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'assignment_id',
        'course_id',
        'name',
        'nosubmissions',
        'duedate',
        'allowsubmissionsfromdate',
        'grade',
        'cmid',
        'intro',
        'introformat'
    ];

    /**
     * Get the course associated with the assignment.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(AssignmentAttachment::class, "assignment_id", "assignment_id");
    }

    // public function grade(): ?Grade
    // {
    //     return Grade::where("cmid", $this->cmid)->first();
    // }

    public function relatedGrade(): HasOne
    {
        return $this->hasOne(Grade::class, "cmid", "cmid");
    }

    public function toEntity(): EntitiesAssignment
    {
        return new EntitiesAssignment(
            assignment_id: $this->assignment_id,
            course_id: $this->course_id,
            cmid: $this->cmid,
            name: $this->name,
            nosubmissions: (bool)$this->nosubmissions,
            duedate: $this->duedate,
            allowsubmissionsfromdate: $this->allowsubmissionsfromdate,
            grade: $this->grade,
            introattachments: $this
                ->attachments
                ->map(function (AssignmentAttachment $attachment): IntroAttachment {
                    return new IntroAttachment(
                        filename: $attachment->filename,
                        filepath: $attachment->filepath,
                        filesize: $attachment->filesize,
                        fileurl: $attachment->fileurl,
                        timemodified: $attachment->timemodified,
                        mimetype: $attachment->mimetype,
                        isexternalfile: (bool)$attachment->isexternalfile,
                    );
                })
                ->all(),
            intro: $this->intro,
            introformat: $this->introformat,
            gradeEntity: $this->relatedGrade?->toEntity()
        );
    }

    public function submission(): HasOne
    {
        return $this->hasOne(UserAssignmentSubmission::class, 'assignment_id', 'assignment_id');
    }
}
