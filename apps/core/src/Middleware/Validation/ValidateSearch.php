<?php

namespace App\Middleware\Validation;

class ValidateSearch extends ValidationMiddleware
{
    protected bool $validateBody = true;
    protected bool $validateQuery = false;

    protected array $queryRules = [];
    protected array $bodyRules = [
        'query' => 'required|is_string'
    ];
}
