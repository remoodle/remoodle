<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\Entities\CourseModuleDate as EntitiesCourseModuleDate;
use Illuminate\Database\Eloquent\Model;

class CourseModuleDate extends Model
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
    protected $primaryKey = 'hash';
    protected $keyType = "string";

    protected $fillable = [
        'hash',
        "cmid",
        "label",
        "timestamp",
    ];

    /**
     * @return \App\Modules\Moodle\Entities\CourseModuleDate
     */
    public function toEntity(): EntitiesCourseModuleDate
    {
        return new EntitiesCourseModuleDate(
            cmid: $this->cmid,
            label: $this->label,
            timestamp: $this->timestamp,
        );
    }
}
