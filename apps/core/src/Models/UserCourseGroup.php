<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserCourseGroup extends ModelAbstract
{
    public $incrementing = false;
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $table = 'user_groups';
    protected $hidden = ["laravel_through_key"];

    protected $fillable = ['moodle_id', 'group_id'];

    public function group(): BelongsTo
    {
        return $this->belongsTo(CourseGroup::class, 'group_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(MoodleUser::class, 'moodle_id', 'moodle_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'group_id', 'group_id');
    }
}
