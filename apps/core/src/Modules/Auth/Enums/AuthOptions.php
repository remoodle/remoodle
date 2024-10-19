<?php

declare(strict_types=1);

namespace App\Modules\Auth\Enums;

enum AuthOptions: string
{
    case PASSWORD = "password";
    case CODE_CUSTOM = "custom";
}
