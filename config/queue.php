<?php

use Queue\Handlers\ParseUserCourses;
use Queue\Handlers\ParseUserGrades;

return [
    'handlers' => [
        'user_registered' => ParseUserCourses::class,
        'user_parse_grades' => ParseUserGrades::class
    ]
];