<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\Entities\CourseModuleCompletionData as EntitiesCourseModuleCompletionData;
use Illuminate\Database\Eloquent\Model;

class CourseModuleCompletionData extends ModelAbstract
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
    protected $primaryKey = 'cmid';

    protected $fillable = [
        "cmid",
        "overrideby",
        "state",
        "timecompleted",
        "valueused",
        "hascompletion",
        "isautomatic",
        "istrackeduser",
        "uservisible",
    ];

    /**
     * @return \App\Modules\Moodle\Entities\CourseModuleCompletionData
     */
    public function toEntity(): EntitiesCourseModuleCompletionData
    {
        return new EntitiesCourseModuleCompletionData(
            cmid: $this->cmid,
            state: $this->state,
            timecompleted: $this->timecompleted,
            valueused: (bool)$this->valueused,
            hascompletion: (bool)$this->hascompletion,
            isautomatic: (bool)$this->isautomatic,
            istrackeduser: (bool)$this->istrackeduser,
            uservisible: (bool)$this->uservisible,
            overrideby: $this->overrideby,
        );
    }
}
