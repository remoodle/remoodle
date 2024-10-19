<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

class CourseModuleAttachment
{
    /**
     * @param int $cmid
     * @param string $type
     * @param string $filename
     * @param null|string $filepath
     * @param int $filesize
     * @param null|string $fileurl
     * @param null|int $timecreated
     * @param null|int $timemodified
     * @param null|int $sortorder
     * @param null|string $mimetype
     * @param null|bool $isexternalfile
     * @param null|int $userid
     * @param null|string $author
     * @param null|string $license
     */
    public function __construct(
        public readonly int $cmid,
        public readonly string $type,
        public readonly string $filename,
        public readonly ?string $filepath,
        public readonly int $filesize,
        public readonly ?string $fileurl,
        public readonly ?int $timecreated,
        public readonly ?int $timemodified,
        public readonly ?int $sortorder,
        public readonly ?string $mimetype,
        public readonly ?bool $isexternalfile,
        public readonly ?int $userid,
        public readonly ?string $author,
        public readonly ?string $license,
    ) {
    }

    /**
     * @return string
     */
    public function hash(): string
    {
        return hash('sha256', $this->cmid."|".$this->filename.$this->fileurl.$this->timemodified);
    }
}
