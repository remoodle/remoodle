<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Entities\Search;

enum SearchTypeEnum: string
{
    case ASSIGNMENT = 'assignment';
    case EVENT = 'event';
    case COURSE = 'course';
    case GRADE = 'grade';
    // case INTROATTACHMENT = 'introattachment';
}
