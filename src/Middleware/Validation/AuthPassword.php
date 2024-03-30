<?php

namespace App\Middleware\Validation;

class AuthPassword extends ValidationMiddleware
{
    protected bool $validateBody = true;
    protected bool $validateQuery = false;

    protected array $queryRules = [];
    protected array $bodyRules = [
        'password' => 'required',
        'identifier' => 'required'
    ];
}
