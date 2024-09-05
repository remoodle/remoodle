<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Modules\Moodle\Entities\Event as EventEntity;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends ModelAbstract
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

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    // public function assignment(): ?Assignment
    // {
    //     return Assignment::where("cmid", $this->instance)->first();
    // }

    public function assignment(): HasOne
    {
        return $this->hasOne(Assignment::class, "cmid", "instance");
        // return Assignment::where("cmid", $this->instance)->first();
    }


    public function toEntity(): EventEntity
    {
        return new EventEntity(
            event_id: $this->event_id,
            name: $this->name,
            instance: $this->instance,
            timestart: $this->timestart,
            visible: (bool)$this->visible,
            course_name: $this->course_name,
            course_id: $this->course_id,
            assignment: $this->assignment?->toEntity()
        );
    }
}
