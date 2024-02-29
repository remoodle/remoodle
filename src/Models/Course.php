<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Course extends Model
{        
    public $incrementing = false;
    protected $primaryKey = 'course_id';
    public $timestamps = false;
    protected $table = 'courses';
    protected $hidden = ["laravel_through_key"];

    protected $fillable = [
        'course_id', 'name', 'coursecategory', 'start_date', 'end_date', 'url'
    ];

    public function courseModules(): HasMany
    {
        return $this->hasMany(CourseModule::class, 'course_id', 'course_id');
    }

    public function grades(): HasManyThrough
    {
        return $this->hasManyThrough(
            Grade::class,
            CourseModule::class,
            'course_id',
            'cmid',
            'course_id', 
            'cmid'
        );
    }

    public function users(): HasManyThrough
    {
        return $this->hasManyThrough(
            MoodleUser::class,
            UserCourseAssign::class,
            'course_id',
            'moodle_id',
            'course_id', 
            'moodle_id'
        );
    }
}