<?php

return [
    'driver' => $_ENV["DATABASE_DRIVER"] ?? null,
    'host' => $_ENV["DATABASE_HOST"] ?? null,
    'database' => $_ENV["DATABASE_NAME"] ?? null,
    'username' => $_ENV["DATABASE_USERNAME"] ?? null,
    'password' => $_ENV["DATABASE_PASSWORD"] ?? null,
    'charset' => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix' => '',
];