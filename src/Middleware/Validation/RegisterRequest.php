<?php

declare(strict_types=1);

namespace App\Middleware\Validation;

class RegisterRequest extends ValidationMiddleware
{
    protected bool $validateBody = true;
    protected bool $validateQuery = false;

    protected array $queryRules = [];
    protected array $bodyRules = [
        "token" => "required|is:string",
        "name_alias" => ['regex:/^[a-zA-Z]{3,32}$/'],
    ];
}
