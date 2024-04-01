<?php

declare(strict_types=1);

namespace App\Modules\Moodle\Enums;

enum CourseEnrolledClassification: string
{
    case INPROGRESS = "inprogress";
    case PAST = "past";
    case FUTURE = "future";
}
