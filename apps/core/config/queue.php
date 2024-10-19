<?php

declare(strict_types=1);

use App\Modules\Jobs\JobsEnum;
use Queue\Handlers\InitializeUser;
use Queue\Handlers\ParseCourseContents;
use Queue\Handlers\ParseUserAssignments;
use Queue\Handlers\ParseUserCourses;
use Queue\Handlers\ParseUserEvents;
use Queue\Handlers\ParseUserEventsBatch;
use Queue\Handlers\ParseUserGrades;

return [
    'handlers' => [
        JobsEnum::PARSE_COURSE_CONTENTS->value => ParseCourseContents::class,
        JobsEnum::PARSE_COURSES->value => ParseUserCourses::class,
        JobsEnum::PARSE_GRADES->value => ParseUserGrades::class,
        JobsEnum::PARSE_EVENTS->value => ParseUserEvents::class,
        JobsEnum::SET_INITIALIZED->value => InitializeUser::class,
        JobsEnum::PARSE_ASSIGNMENTS->value => ParseUserAssignments::class,
        JobsEnum::BATCH_PARSE_EVENTS->value => ParseUserEventsBatch::class
    ]
];
