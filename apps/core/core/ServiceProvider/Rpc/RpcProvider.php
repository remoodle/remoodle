<?php

declare(strict_types=1);

namespace Core\ServiceProvider\Rpc;

use Core\ServiceProvider\ServiceProviderInterface;
use Core\Container;
use Spiral\RoadRunner\KeyValue\Factory;
use Core\Config;
use App\Modules\Jobs\Factory as JobsFactory;
use App\Modules\Jobs\FactoryInterface;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

class RpcProvider implements ServiceProviderInterface
{
    public function register(Container $container): void
    {
        $rpcIgbinaryFactory = (new Factory(RPC::create(Config::get("rpc.connection"))))
            ->withSerializer(new IgbinarySerializer());

        $container->singleton(Factory::class, function () use ($rpcIgbinaryFactory) {
            return $rpcIgbinaryFactory;
        });

        $container->bind(FactoryInterface::class, JobsFactory::class);
    }

    public function boot(Container $container): void
    {

    }
}
