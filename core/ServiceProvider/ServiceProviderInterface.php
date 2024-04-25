<?php

declare(strict_types=1);

namespace Core\ServiceProvider;

use Core\Container;

interface ServiceProviderInterface
{
    /**
     * @param Container $container
     * @return void
     */
    public function boot(Container $container): void;

    /**
     * @param Container $container
     * @return void
     */
    public function register(Container $container): void;
}
