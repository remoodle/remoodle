<?php

namespace App\Modules\Moodle\Enums;

enum CourseEnrolledClassification: string
{
    case INPROGRESS = "inprogress";
    case PAST = "past";
    case FUTURE = "future";
}
