<?php

declare(strict_types=1);

namespace App\Modules\Jobs;

enum JobsEnum: string
{
    case NOTIFICATION_WEBHOOK = 'notification_webhook';
    case PARSE_COURSES = 'user_parse_courses';
    case PARSE_GRADES = 'user_parse_grades';
    case PARSE_EVENTS = 'user_parse_events';
    case PARSE_COURSE_ASSIGNMENTS = 'user_parse_course_assignments';
    case SET_INITIALIZED = 'user_set_initialized';
}
