<?php

declare(strict_types=1);

namespace Core\ServiceProvider\Application;

use App\Controllers\AuthController;
use App\Controllers\SettingsController;
use App\Middleware\Auth as MiddlewareAuth;
use App\Modules\Auth\Auth;
use App\Repositories\UserMoodle\ApiUserMoodleRepositoryInterface;
use App\Repositories\UserMoodle\Concrete\ApiUserMoodleRepository;
use App\Repositories\UserMoodle\Concrete\DatabaseUserMoodleRepository;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Core\ServiceProvider\ServiceProviderInterface;
use Core\Container;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\StorageInterface;

class ApplicationProvider implements ServiceProviderInterface
{
    public function register(Container $container): void
    {
        $container->bind(DatabaseUserMoodleRepositoryInterface::class, function (Container $cont) {
            return $cont->make(DatabaseUserMoodleRepository::class);
        });
        $container->bind(ApiUserMoodleRepositoryInterface::class, ApiUserMoodleRepository::class);

        $container
            ->when(AuthController::class)
            ->needs(StorageInterface::class)
            ->give(function () use ($container) {
                return $container->get(Factory::class)->select('users');
            });

        $container
            ->when(SettingsController::class)
            ->needs(StorageInterface::class)
            ->give(function () use ($container) {
                return $container->get(Factory::class)->select('users');
            });

        $container
            ->when(Auth::class)
            ->needs(StorageInterface::class)
            ->give(function () use ($container) {
                return $container->get(Factory::class)->select('users');
            });

        $container
            ->when(MiddlewareAuth::class)
            ->needs(StorageInterface::class)
            ->give(function () use ($container) {
                return $container->get(Factory::class)->select('users');
            });
    }

    public function boot(Container $container): void
    {

    }
}
