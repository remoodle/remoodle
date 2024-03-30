<?php

namespace App\Middleware\Validation;

class VerifyUserEmail extends ValidationMiddleware
{
    protected bool $validateBody = true;
    protected bool $validateQuery = false;

    protected array $queryRules = [];
    protected array $bodyRules = [
        "code" => "required|is:numeric",
    ];
}
