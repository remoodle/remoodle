<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\Entities\CourseModuleAttachment as EntitiesCourseModuleAttachment;
use Illuminate\Database\Eloquent\Model;

class CourseModuleAttachment extends ModelAbstract
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
        "type",
        "filename",
        "filepath",
        "filesize",
        "fileurl",
        "timecreated",
        "timemodified",
        "sortorder",
        "mimetype",
        "isexternalfile",
        "userid",
        "author",
        "license",
    ];

    /**
     * @return \App\Modules\Moodle\Entities\CourseModuleAttachment
     */
    public function toEntity(): EntitiesCourseModuleAttachment
    {
        return new EntitiesCourseModuleAttachment(
            cmid: $this->cmid,
            type: $this->type,
            filename: $this->filename,
            filepath: $this->filepath,
            filesize: $this->filesize,
            fileurl: $this->fileurl,
            timecreated: $this->timecreated,
            timemodified: $this->timemodified,
            sortorder: $this->sortorder,
            mimetype: $this->mimetype,
            isexternalfile: (bool)$this->isexternalfile,
            userid: $this->userid,
            author: $this->author,
            license: $this->license,
        );
    }
}
