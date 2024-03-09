<?php 

namespace App\Middleware\Validation;

class GetCourseGrades extends ValidationMiddleware
{
    protected bool $validateBody = false;
    protected bool $validateQuery = true;

    protected array $queryRules = [
        "course_id" => "required|is:numeric"
    ];
}