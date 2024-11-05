<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\Entities\UserAssignmentSubmission as EntitiesUserAssignmentSubmission;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Thiagoprz\CompositeKey\HasCompositeKey;

class UserAssignmentSubmission extends Model
{
    use HasCompositeKey;
    /**
     * @var array<int, string>
     * @phpstan-ignore-next-line
     */
    protected $primaryKey = ['moodle_id', 'submission_id'];
    public $timestamps  = false;
    protected $table = 'user_assignment_submission';
    protected $fillable = [
        'submission_id',
        'timecreated',
        'timemodified',
        'submissionsenabled',
        'extensionduedate',
        'cansubmit',
        'graded',
        'moodle_id',
        'assignment_id',
        'submitted'
    ];
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id', 'assignment_id');
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(MoodleUser::class, 'moodle_id', 'moodle_id');
    }
    public function toEntity(): EntitiesUserAssignmentSubmission
    {
        return new EntitiesUserAssignmentSubmission(
            timecreated: $this->timecreated,
            timemodified: $this->timemodified,
            submissionsenabled: (bool)$this->submissionsenabled,
            extensionduedate: $this->extensionduedate,
            cansubmit: (bool)$this->cansubmit,
            graded: (bool)$this->graded,
            assignment_id: $this->assignment_id,
            submission_id: $this->submission_id,
            submitted: (bool)$this->submitted
        );
    }
}
