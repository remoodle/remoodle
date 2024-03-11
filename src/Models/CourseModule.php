<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseModule extends Model
{        
    public $incrementing = false;
    protected $primaryKey = 'cmid';
    public $timestamps = false;
    protected $table = 'course_modules';

    protected $fillable = [
        'cmid', 'course_id',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'cmid', 'cmid');
    }
}