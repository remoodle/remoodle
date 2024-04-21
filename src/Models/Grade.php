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
    protected $primaryKey = 'grade_id';
    public $timestamps = false;
    protected $table = 'grades';

    protected $fillable = [
        'grade_id', 'cmid', 'name', 'percentage', 'moodle_id', 'itemtype'
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
            name: $this->name
        );
    }
}
