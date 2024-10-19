<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\Entities\Course as CourseEntity;
use App\Modules\Moodle\Enums\CourseEnrolledClassification;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * @property int $course_id
 * @property string $name
 * @property string $coursecategory
 * @property int $start_date
 * @property int $end_date
 * @property string $url
 * @property string $status
 */
class Course extends ModelAbstract
{
    public $incrementing = false;
    protected $primaryKey = 'course_id';
    public $timestamps = false;
    protected $table = 'courses';
    protected $hidden = ["laravel_through_key"];

    protected $fillable = [
        'course_id', 'name', 'coursecategory', 'start_date', 'end_date', 'url', 'status'
    ];

    public function courseModules(): HasMany
    {
        return $this->hasMany(CourseModule::class, 'course_id', 'course_id');
    }

    public function gradesThroughModules(): HasManyThrough
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

    public function registerGrades(): HasMany
    {
        return $this->grades()->where('cmid', null);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'course_id', 'course_id');
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

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, "course_id", "course_id");
    }

    public function toEntity(): CourseEntity
    {
        return new CourseEntity(
            course_id: $this->course_id,
            name: $this->name,
            coursecategory: $this->coursecategory,
            start_date: $this->start_date,
            end_date: $this->end_date,
            url: $this->url,
            status: CourseEnrolledClassification::from($this->status)
        );
    }
}
