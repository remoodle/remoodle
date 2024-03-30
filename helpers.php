<?php

function getEnvVar(string $key, mixed $default = null): string|bool|null
{
    if($val = getenv($key)) {
        return $val;
    }

<<<<<<< HEAD
    if(isset($_ENV[$key])) {
        $a = "sd";
=======
    if(isset($_ENV[$key])){
        $a = 3 + 3;
>>>>>>> 30c313c97de8844eec775cd93c31e5f1484ccc0b
        return $_ENV[$key];
    }

    return $default;
}
