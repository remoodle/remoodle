<?php

use Queue\Handlers\ParseUserCourses;

return [
    'handlers' => [
        'user_registered' => ParseUserCourses::class
    ]
];