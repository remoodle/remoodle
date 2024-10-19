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
        'deadlines_notification' => 'is:numeric|in:1,0',
        'grades_notification' => 'is:numeric|in:1,0',
        // 'notify_method'=>'in:email,get_update,webhook'
    ];
}
