<?php

declare(strict_types=1);

namespace App\Middleware\Validation;

class GetCourseGrades extends ValidationMiddleware
{
    protected bool $validateBody = false;
    protected bool $validateQuery = true;

    protected array $queryRules = [
        "course_id" => "required|is:numeric"
    ];
}
