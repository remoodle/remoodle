<?php

use App\Controllers\AuthController;
use Core\Container;
use App\Middleware\Auth;
use App\Modules\Notification\Providers\Mail\Mailers\Resend;
use App\Repositories\UserMoodle\ApiUserMoodleRepositoryInterface;
use App\Repositories\UserMoodle\Concrete\ApiUserMoodleRepository;
use App\Repositories\UserMoodle\Concrete\DatabaseUserMoodleRepository;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Factory\StreamFactory;
use Slim\Psr7\Factory\UploadedFileFactory;
use Core\Config;
use Phlib\Encrypt\Encryptor\OpenSsl;
use Psr\Http\Message\ServerRequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\UploadedFileFactoryInterface;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\Http\PSR7Worker;
use Spiral\RoadRunner\Http\PSR7WorkerInterface;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;
use Spiral\RoadRunner\KeyValue\StorageInterface;
use Spiral\RoadRunner\Worker;
use Spiral\RoadRunner\WorkerInterface;

$responseFactory = new ResponseFactory();
$serverRequestFactory = new ServerRequestFactory();
$streamFactory = new StreamFactory();
$uploadedFileFactory = new UploadedFileFactory();

$encryptor = new OpenSsl(base64_decode(Config::get("crypt.key")));
$rpcIgbinaryFactory = (new Factory(RPC::create(Config::get("rpc.connection"))))->withSerializer(new IgbinarySerializer());

$container = new Container();

$container->singleton(Psr\Http\Message\ResponseFactoryInterface::class, function() use ($responseFactory){
    return $responseFactory;
});
$container->singleton(ServerRequestFactoryInterface::class, function() use ($serverRequestFactory) {
    return $serverRequestFactory;
});
$container->singleton(StreamFactoryInterface::class, function() use ($streamFactory) {
    return $streamFactory;
});
$container->singleton(UploadedFileFactoryInterface::class, function() use ($uploadedFileFactory) {
    return $uploadedFileFactory;
});
$container->bind(WorkerInterface::class, function(){
    return Worker::create();
});
$container->bind(PSR7WorkerInterface::class, function(Container $container){
    return $container->make(PSR7Worker::class);
});
$container->bind(DatabaseUserMoodleRepositoryInterface::class, function(Container $cont){
    return $cont->make(DatabaseUserMoodleRepository::class);
});
$container->bind(ApiUserMoodleRepositoryInterface::class, ApiUserMoodleRepository::class);
$container->bind(Resend::class, function(){
    return new Resend(Config::get("mail.resend.key"), Config::get("mail.from"));
});
$container->bind(Auth::class, function() use ($rpcIgbinaryFactory){
    return new Auth($rpcIgbinaryFactory->select('users'));
});
$container
    ->when(AuthController::class)
    ->needs(StorageInterface::class)
    ->give(function() use ($rpcIgbinaryFactory){
        return $rpcIgbinaryFactory->select('users');
});

return $container;