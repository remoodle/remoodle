<?php

return [
    'driver' => getEnvVar("DATABASE_DRIVER") ?? null,
    'host' => getEnvVar("DATABASE_HOST") ?? null,
    'port' => getEnvVar("DATABASE_PORT") ?? null,
    'database' => getEnvVar("DATABASE_NAME") ?? null,
    'username' => getEnvVar("DATABASE_USERNAME") ?? null,
    'password' => getEnvVar("DATABASE_PASSWORD") ?? null,
    'charset' => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix' => '',
];