<?php

declare(strict_types=1);
use App\Controllers\AuthController;
use App\Controllers\SettingsController;
use Core\Container;
use App\Middleware\Auth;
use App\Modules\Jobs\Factory as JobsFactory;
use App\Modules\Jobs\FactoryInterface;
use App\Modules\Notification\Providers\Mail\Mailers\Resend;
use App\Modules\Search\Engines\EloquentSearch;
use App\Modules\Search\LemmetizationInterface;
use App\Modules\Search\Lemmetizations\KeyValueLemmetization;
use App\Modules\Search\SearchEngineInterface;
use Core\Config;
use Phlib\Encrypt\Encryptor\OpenSsl;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ServerRequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\UploadedFileFactoryInterface;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;
use Spiral\RoadRunner\{Worker, WorkerInterface};
use App\Repositories\UserMoodle\{ApiUserMoodleRepositoryInterface,DatabaseUserMoodleRepositoryInterface};
use Slim\Psr7\Factory\{ResponseFactory,ServerRequestFactory,StreamFactory,UploadedFileFactory};
use App\Repositories\UserMoodle\Concrete\{ApiUserMoodleRepository,DatabaseUserMoodleRepository};
use Illuminate\Database\Connection;
use Spiral\RoadRunner\Http\{PSR7Worker,PSR7WorkerInterface};
use Spiral\RoadRunner\KeyValue\{Factory,StorageInterface};

$responseFactory = new ResponseFactory();
$serverRequestFactory = new ServerRequestFactory();
$streamFactory = new StreamFactory();
$uploadedFileFactory = new UploadedFileFactory();

$encryptor = new OpenSsl(base64_decode(Config::get("crypt.key")));
$rpcIgbinaryFactory = (new Factory(RPC::create(Config::get("rpc.connection"))))->withSerializer(new IgbinarySerializer());

$container = new Container();

$container->singleton(Factory::class, function () use ($rpcIgbinaryFactory) {
    return $rpcIgbinaryFactory;
});

$container->singleton(Psr\Http\Message\ResponseFactoryInterface::class, function () use ($responseFactory) {
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
$container->bind(DatabaseUserMoodleRepositoryInterface::class, function (Container $cont) {
    return $cont->make(DatabaseUserMoodleRepository::class);
});
$container->bind(FactoryInterface::class, JobsFactory::class);
$container->bind(ApiUserMoodleRepositoryInterface::class, ApiUserMoodleRepository::class);
$container->bind(Resend::class, function () {
    return new Resend(Config::get("mail.resend.key"), Config::get("mail.from"));
});
$container->bind(Auth::class, function () use ($rpcIgbinaryFactory) {
    return new Auth($rpcIgbinaryFactory->select('users'));
});
$container
    ->when(AuthController::class)
    ->needs(StorageInterface::class)
    ->give(function () use ($rpcIgbinaryFactory) {
        return $rpcIgbinaryFactory->select('users');
    });

$container
    ->when(SettingsController::class)
    ->needs(StorageInterface::class)
    ->give(function () use ($rpcIgbinaryFactory) {
        return $rpcIgbinaryFactory->select('users');
    });
$container->bind(ContainerInterface::class, function () use ($container) {
    return $container;
});

$container->bind(EloquentSearch::class, function (Container $container) {
    return new EloquentSearch($container->get(Connection::class), $container->get(KeyValueLemmetization::class));
});
$container->bind(SearchEngineInterface::class, EloquentSearch::class);

return $container;
