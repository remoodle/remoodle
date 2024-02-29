<?php

use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Factory\StreamFactory;
use Slim\Psr7\Factory\UploadedFileFactory;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;

$container = new ContainerBuilder();
// $builder->useAutowiring(true);

$responseFactory = new ResponseFactory();
$serverRequestFactory = new ServerRequestFactory();
$streamFactory = new StreamFactory();
$uploadedFileFactory = new UploadedFileFactory();


$container->register(Psr\Http\Message\ResponseFactoryInterface::class, get_class($responseFactory))
    ->setPublic(true);

$container->register(Psr\Http\Message\ServerRequestFactoryInterface::class, get_class($serverRequestFactory))
    ->setPublic(true);

$container->register(Psr\Http\Message\StreamFactoryInterface::class, get_class($streamFactory))
    ->setPublic(true);

$container->register(Psr\Http\Message\UploadedFileFactoryInterface::class, get_class($uploadedFileFactory))
    ->setPublic(true);

$workerServiceDefinition = new Definition(Spiral\RoadRunner\Worker::class);
$workerServiceDefinition->setFactory([Spiral\RoadRunner\Worker::class, 'create']);
$container->setDefinition(Spiral\RoadRunner\WorkerInterface::class, $workerServiceDefinition)
    ->setPublic(true);

$container->register(Spiral\RoadRunner\Http\PSR7WorkerInterface::class, Spiral\RoadRunner\Http\PSR7Worker::class)
    ->setAutowired(true)
    ->setAutoconfigured(true)
    ->setPublic(true);

$container->register(Queue\HandlerFactory\Factory::class, Queue\HandlerFactory\Factory::class)
    ->setAutowired(true)
    ->setAutoconfigured(true)
    ->setPublic(true);


return $container;