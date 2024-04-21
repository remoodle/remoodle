<?php 

namespace App\Middleware\Validation;

class CourseAssign extends ValidationMiddleware
{
    protected bool $validateBody = false;
    protected bool $validateQuery = false;

    protected array $queryRules = [];
    protected array $bodyRules = [];
}