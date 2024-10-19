<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\Entities\Group;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $course_id
 * @property int $descriptionformat
 * @property string $idnumber
 * @property string $name
 * @property string $description
 */
class CourseGroup extends ModelAbstract
{
    public $incrementing = false;
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $table = 'course_groups';
    protected $hidden = ["laravel_through_key"];

    protected $fillable = ['id', 'course_id', 'name', 'idnumber', 'description', 'descriptionformat'];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'group_id', 'id');
    }

    // public function users(): HasMany
    // {
    //     return $this->hasMany(
    //         MoodleUser::class,
    //         UserCourseAssign::class,
    //         'course_id',
    //         'moodle_id',
    //         'course_id',
    //         'moodle_id'
    //     );
    // }

    public function toEntity(): Group
    {
        return new Group(
            id: $this->id,
            course_id: $this->course_id,
            descriptionformat: $this->descriptionformat,
            idnumber: $this->idnumber,
            name: $this->name,
            description: $this->description,
        );
    }
}
