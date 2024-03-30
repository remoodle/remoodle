<?php

function getEnvVar(string $key, mixed $default = null): string|bool|null
{
    if($val = getenv($key)) {
        return $val;
    }

    if(isset($_ENV[$key])) {
        $a = "sd";
        return $_ENV[$key];
    }

    return $default;
}
