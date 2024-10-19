<?php

declare(strict_types=1);
return [
    'paths' => [
        'migrations' => __DIR__ . '/../db/migrations',
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment' => 'development',
        'development' => [
            'adapter' => getEnvVar("DATABASE_DRIVER") ?? 'mysql',
            'host' => getEnvVar("DATABASE_HOST") ?? null,
            'name' => getEnvVar("DATABASE_NAME") ?? null,
            'user' => getEnvVar("DATABASE_USERNAME") ?? null,
            'pass' => getEnvVar("DATABASE_PASSWORD") ?? null,
            'port' => getEnvVar("DATABASE_PORT") ?? '3306',
            'charset' => 'utf8',
        ],
    ],
    'version_order' => 'creation'
];
