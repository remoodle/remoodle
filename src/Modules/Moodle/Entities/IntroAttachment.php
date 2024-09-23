<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities;

class IntroAttachment
{
    /**
     * @param string $filename
     * @param string $filepath
     * @param int $filesize
     * @param null|string $fileurl
     * @param int $timemodified
     * @param string $mimetype
     * @param bool $isexternalfile
     */
    public function __construct(
        public readonly string $filename,
        public readonly string $filepath,
        public readonly int $filesize,
        public readonly ?string $fileurl,
        public readonly int $timemodified,
        public readonly string $mimetype,
        public readonly bool $isexternalfile,
    ) {
    }

    /**
     * @param int $assignment_id
     * @return string
     */
    public function hash(int $assignment_id): string
    {
        return hash('sha256', $assignment_id."|".$this->filename.$this->fileurl.$this->timemodified);
    }
}
