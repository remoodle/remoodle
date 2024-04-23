<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use App\Modules\Moodle\Entities\Grade as GradeEntity;

class Grade extends Model
{
    public $incrementing = false;
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $table = 'grades';

    protected $fillable = [
        'grade_id',
        'cmid',
        'name',
        'percentage',
        'moodle_id',
        'itemtype',
        'itemmodule',
        'iteminstance',
        'grademin',
        'grademax',
        'feedbackformat',
        'graderaw',
        'feedback'
    ];

    public function courseModule(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'cmid', 'cmid');
    }

    public function course(): HasOneThrough
    {
        return $this->hasOneThrough(Course::class, CourseModule::class, 'cmid', 'course_id', 'cmid', 'course_id');
    }

    public function toEntity()
    {
        return new GradeEntity(
            grade_id: $this->grade_id,
            cmid: $this->cmid,
            percentage: $this->percentage,
            moodle_id: $this->moodle_id,
            itemtype: $this->itemtype,
            name: $this->name,
            grademax: $this->grademax,
            grademin: $this->grademin,
            feedbackformat: $this->feedbackformat,
            itemmodule: $this->itemmodule,
            graderaw: $this->graderaw,
            feedback: $this->feedback,
            iteminstance: $this->iteminstance
        );
    }

    public static function findFromEntity(int|string $moodle_id, int|string $grade_id): ?static
    {
        return static::where("moodle_id", (int) $moodle_id)->where('grade_id', (int) $grade_id)->first();
    }
}
