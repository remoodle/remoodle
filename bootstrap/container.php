<?php
use DI\ContainerBuilder;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\StreamFactory;
use Slim\Psr7\Factory\UploadedFileFactory;

$builder = new ContainerBuilder();
$builder->useAutowiring(true);

$responseFactory = new ResponseFactory();
$serverRequestFactory = new ServerRequestFactory();
$streamFactory = new StreamFactory();
$uploadedFileFactory = new UploadedFileFactory();


$builder->addDefinitions([
    Psr\Http\Message\ResponseFactoryInterface::class => $responseFactory,
    Psr\Http\Message\ServerRequestFactoryInterface::class => $serverRequestFactory,
    Psr\Http\Message\StreamFactoryInterface::class => $streamFactory,
    Psr\Http\Message\UploadedFileFactoryInterface::class => $uploadedFileFactory,
    Spiral\RoadRunner\WorkerInterface::class => Spiral\RoadRunner\Worker::create(),
    Spiral\RoadRunner\Http\PSR7WorkerInterface::class => DI\autowire(Spiral\RoadRunner\Http\PSR7Worker::class)
]);

return $builder->build();