<?php

namespace App\Middleware\Validation;

class GetCourseContent extends ValidationMiddleware
{
    protected bool $validateBody = false;
    protected bool $validateQuery = true;

    protected array $queryRules = [
        'content' => 'is:numeric|in:1,0'
    ];
    protected array $bodyRules = [];
}
