<?php

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
use DI\ContainerBuilder;
use Core\Config;
use Phlib\Encrypt\Encryptor\OpenSsl;
use Phlib\Encrypt\EncryptorInterface;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;
use Spiral\RoadRunner\KeyValue\StorageInterface;

$builder = new ContainerBuilder();
$builder->useAutowiring(true);

$responseFactory = new ResponseFactory();
$serverRequestFactory = new ServerRequestFactory();
$streamFactory = new StreamFactory();
$uploadedFileFactory = new UploadedFileFactory();
$encryptor = new OpenSsl(base64_decode(Config::get("crypt.key")));
$rpcIgbinaryFactory = (new Factory(RPC::create(Config::get("rpc.connection"))))->withSerializer(new IgbinarySerializer());

$builder->addDefinitions([
    Psr\Http\Message\ResponseFactoryInterface::class => $responseFactory,
    Psr\Http\Message\ServerRequestFactoryInterface::class => $serverRequestFactory,
    Psr\Http\Message\StreamFactoryInterface::class => $streamFactory,
    Psr\Http\Message\UploadedFileFactoryInterface::class => $uploadedFileFactory,
    Spiral\RoadRunner\WorkerInterface::class => Spiral\RoadRunner\Worker::create(),
    Spiral\RoadRunner\Http\PSR7WorkerInterface::class => DI\autowire(Spiral\RoadRunner\Http\PSR7Worker::class),
    DatabaseUserMoodleRepositoryInterface::class => function(){
        return new DatabaseUserMoodleRepository();
    },
    ApiUserMoodleRepositoryInterface::class => function(){
        return new ApiUserMoodleRepository();
    },
    Resend::class => function(): Resend{
        return new Resend(Config::get("mail.resend.key"), Config::get("mail.from"));
    },
    Auth::class => DI\factory(function() use ($rpcIgbinaryFactory){
        return new Auth($rpcIgbinaryFactory->select('users'));
    }),
    EncryptorInterface::class => $encryptor
]);

return $builder->build();