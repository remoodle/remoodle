<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
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
     * @var array
     */
    protected $fillable = [
        'assignment_id',
        'course_id',
        'name',
        'nosubmissions',
        'duedate',
        'allowsubmissionsfromdate',
        'grade',
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
}
