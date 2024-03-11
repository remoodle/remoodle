<?php

return [
    'paths' => [
        'migrations' => __DIR__ . '/../db/migrations',
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment' => 'development',
        'development' => [
            'adapter' => $_ENV["DATABASE_DRIVER"] ?? 'mysql',
            'host' => $_ENV["DATABASE_HOST"] ?? null,
            'name' => $_ENV["DATABASE_NAME"] ?? null,
            'user' => $_ENV["DATABASE_USERNAME"] ?? null,
            'pass' => $_ENV["DATABASE_PASSWORD"] ?? null,
            'port' => $_ENV["DATABASE_PORT"] ?? '3306',
            'charset' => 'utf8',
        ],
    ],
    'version_order' => 'creation'
];