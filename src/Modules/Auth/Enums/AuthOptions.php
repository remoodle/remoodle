<?php

namespace App\Modules\Auth\Enums;

enum AuthOptions: string
{
    case PASSWORD = "password";
    case CODE_EMAIL = "email";
    case CODE_CUSTOM = "custom";
}
