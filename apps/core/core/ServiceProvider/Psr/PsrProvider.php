<?php

declare(strict_types=1);

namespace Core\ServiceProvider\Psr;

use Core\ServiceProvider\ServiceProviderInterface;
use Core\Container;
use Spiral\RoadRunner\{Worker, WorkerInterface};
use Spiral\RoadRunner\Http\{PSR7Worker,PSR7WorkerInterface};
use Psr\Http\Message\{
    ResponseFactoryInterface,
    UploadedFileFactoryInterface,
    StreamFactoryInterface,
    ServerRequestFactoryInterface
};
use Slim\Psr7\Factory\{
    ResponseFactory,
    ServerRequestFactory,
    StreamFactory,UploadedFileFactory
};

class PsrProvider implements ServiceProviderInterface
{
    public function register(Container $container): void
    {
        $responseFactory = new ResponseFactory();
        $serverRequestFactory = new ServerRequestFactory();
        $streamFactory = new StreamFactory();
        $uploadedFileFactory = new UploadedFileFactory();

        $container->singleton(ResponseFactoryInterface::class, function () use ($responseFactory) {
            return $responseFactory;
        });
        $container->singleton(ServerRequestFactoryInterface::class, function () use ($serverRequestFactory) {
            return $serverRequestFactory;
        });
        $container->singleton(StreamFactoryInterface::class, function () use ($streamFactory) {
            return $streamFactory;
        });
        $container->singleton(UploadedFileFactoryInterface::class, function () use ($uploadedFileFactory) {
            return $uploadedFileFactory;
        });
        $container->bind(WorkerInterface::class, function () {
            return Worker::create();
        });
        $container->bind(PSR7WorkerInterface::class, function (Container $container) {
            return $container->make(PSR7Worker::class);
        });
    }

    public function boot(\Psr\Container\ContainerInterface $container): void
    {

    }
}
