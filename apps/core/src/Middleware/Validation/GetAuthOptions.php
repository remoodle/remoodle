<?php

declare(strict_types=1);

namespace App\Middleware\Validation;

class GetAuthOptions extends ValidationMiddleware
{
    protected bool $validateBody = true;
    protected bool $validateQuery = false;

    protected array $queryRules = [];
    protected array $bodyRules = [
        'identifier' => 'required'
    ];
}
