<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Grade extends Model
{
    public $incrementing = false;
    protected $primaryKey = 'grade_id';
    public $timestamps = false;
    protected $table = 'grades';

    protected $fillable = [
        'grade_id', 'cmid', 'name', 'percentage', 'moodle_id'
    ];

    public function courseModule(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'cmid', 'cmid');
    }

    public function course(): HasOneThrough
    {
        return $this->hasOneThrough(Course::class, CourseModule::class, 'cmid', 'course_id', 'cmid', 'course_id');
    }
}
