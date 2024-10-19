<?php

declare(strict_types=1);

use Core\ServiceProvider\Application\ApplicationProvider;
use Core\ServiceProvider\Database\DatabaseProvider;
use Core\ServiceProvider\Psr\PsrProvider;
use Core\ServiceProvider\Rpc\RpcProvider;
use Core\ServiceProvider\Search\SearchProvider;

return [
    PsrProvider::class,
    DatabaseProvider::class,
    RpcProvider::class,
    SearchProvider::class,
    ApplicationProvider::class
];
