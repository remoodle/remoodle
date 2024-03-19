<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Thiagoprz\CompositeKey\HasCompositeKey;

class UserCourseAssign extends Model
{        
    use HasCompositeKey;

    protected $fillable = ['moodle_id', 'course_id', 'classification'];
    public $timestamps  = false;  
    protected $table = 'user_course_assign';
    protected $primaryKey = ['moodle_id', 'course_id'];


    public function user(): BelongsTo
    {
        return $this->belongsTo(MoodleUser::class, "moodle_id", "moodle_id");
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(MoodleUser::class, "course_id", "course_id");
    }
}