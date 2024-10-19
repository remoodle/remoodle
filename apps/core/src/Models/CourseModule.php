<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Modules\Moodle\Entities\CourseModule as CourseModuleEntity;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CourseModule extends ModelAbstract
{
    public $incrementing = false;
    protected $primaryKey = 'cmid';
    public $timestamps = false;
    protected $table = 'course_modules';

    protected $fillable = [
        'cmid',
        'course_id',
        'content_id',
        'instance',
        'contextid',
        'modname',
        'modplural',
        'noviewlink',
        'visibleoncoursepage',
        'uservisible',
        'url',
        'completion',
        'description',
        'modicon',
        'name',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'cmid', 'cmid');
    }

    public function completionData(): HasOne
    {
        return $this->hasOne(CourseModuleCompletionData::class, "cmid", "cmid");
    }

    public function dates(): HasMany
    {
        return $this->hasMany(CourseModuleDate::class, "cmid", "cmid");
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(CourseModuleAttachment::class, "cmid", "cmid");
    }

    /**
     * @return \App\Modules\Moodle\Entities\CourseModule
     */
    public function toEntity(): CourseModuleEntity
    {
        return new CourseModuleEntity(
            cmid: $this->cmid,
            contentId: $this->content_id,
            instance: $this->instance,
            contextid: $this->contextid,
            course_id: $this->course_id,
            modname: $this->modname,
            modplural: $this->modplural,
            noviewlink: (bool)$this->noviewlink,
            visibleoncoursepage: $this->visibleoncoursepage,
            uservisible: (bool)$this->uservisible,
            url: $this->url,
            completion: $this->completion,
            description: $this->description,
            modicon: $this->modicon,
            name: $this->name,
            completionData: $this->completionData?->toEntity(),
            dates: $this->dates?->map(function (CourseModuleDate $courseModuleDate) {
                return $courseModuleDate->toEntity();
            })->all(),
            contents: $this->attachments?->map(function (CourseModuleAttachment $courseModuleAttachment) {
                return $courseModuleAttachment->toEntity();
            })->all()
        );
    }
}
