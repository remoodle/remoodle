<?php

function getEnvVar(string $key, mixed $default = null): string|bool|null
{
    if($val = getenv($key)){
        return $val;
    }

    return $default;
}