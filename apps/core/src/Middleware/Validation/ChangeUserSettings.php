<?php

declare(strict_types=1);

namespace App\Middleware\Validation;

class ChangeUserSettings extends ValidationMiddleware
{
    protected bool $validateBody = true;
    protected bool $validateQuery = false;

    protected array $queryRules = [];
    protected array $bodyRules = [
        'name_alias' => 'is:string',
        'password' => 'is:string',
    ];
}
