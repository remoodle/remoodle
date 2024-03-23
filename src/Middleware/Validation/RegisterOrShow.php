<?php 

namespace App\Middleware\Validation;

class RegisterOrShow extends ValidationMiddleware
{
    protected bool $validateBody = true;
    protected bool $validateQuery = false;

    protected array $queryRules = [];
    protected array $bodyRules = [
        "token" => "required|is:string"
    ];
}