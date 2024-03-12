<?php 

namespace App\Modules\Jobs;

enum JobsEnum: string
{
    case NOTIFICATION_EMAIL = 'notification_email';
    case NOTIFICATION_WEBHOOK = 'notification_webhook';
    case PARSE_TOTAL = 'user_registered';
    case PARSE_GRADES = 'user_parse_grades';
    case PARSE_EVENTS = 'user_parse_events';
}