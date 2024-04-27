<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\Entities\CourseContent as EntitiesCourseContent;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CourseContent extends Model
{
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'content_id';

    protected $fillable = [
        'content_id',
        'course_id',
        'name',
        'visible',
        'uservisible',
        'summaryformat',
        'hiddenbynumsections',
        'summary',
        'section'
    ];

    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class, "content_id", "content_id");
    }

    /**
     * @return \App\Modules\Moodle\Entities\CourseContent
     */
    public function toEntity(): EntitiesCourseContent
    {
        return new EntitiesCourseContent(
            id: $this->content_id,
            name: $this->name,
            visible: $this->getAttribute("visible"),
            section: $this->section,
            uservisible: (bool)$this->uservisible,
            summaryformat: $this->summaryformat,
            hiddenbynumsections: $this->hiddenbynumsections,
            summary: $this->summary,
            modules: $this->modules?->map(function (CourseModule $courseModule) {
                return $courseModule->toEntity();
            })->all(),
        );
    }
}
