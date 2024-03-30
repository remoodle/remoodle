<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $primaryKey = 'event_id';

    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'events';

    protected $fillable = [
        'event_id',
        'timestart',
        'instance',
        'name',
        'visible',
        'course_id',
        'course_name'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
}
