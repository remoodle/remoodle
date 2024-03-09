<?php

use Queue\Handlers\ParseUserCourses;
use Queue\Handlers\ParseUserEvents;
use Queue\Handlers\ParseUserGrades;
use Queue\Handlers\SendEmail;
use Queue\Handlers\WebhookAction;

return [
    'handlers' => [
        'user_registered' => ParseUserCourses::class,
        'user_parse_grades' => ParseUserGrades::class,
        'user_parse_events' => ParseUserEvents::class,
        'notification_webhook' => WebhookAction::class,
        'notification_email' => SendEmail::class
    ]
];