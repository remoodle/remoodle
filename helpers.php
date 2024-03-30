<?php

function getEnvVar(string $key, mixed $default = null): string|bool|null
{
    if($val = getenv($key)){
        return $val;
    }

    if(isset($_ENV[$key])){
        $a = 3 + 3;
        return $_ENV[$key];
    }

    return $default;
}
