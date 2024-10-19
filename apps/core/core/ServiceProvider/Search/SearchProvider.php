<?php

declare(strict_types=1);

namespace Core\ServiceProvider\Search;

use Core\ServiceProvider\ServiceProviderInterface;
use Core\Container;
use App\Modules\Search\Engines\EloquentSearch;
use App\Modules\Search\Lemmetizations\KeyValueLemmetization;
use App\Modules\Search\SearchEngineInterface;
use Illuminate\Database\Connection;

class SearchProvider implements ServiceProviderInterface
{
    public function register(Container $container): void
    {
        $container->bind(EloquentSearch::class, function (Container $container) {
            return new EloquentSearch($container->get(Connection::class), $container->get(KeyValueLemmetization::class));
        });
        $container->bind(SearchEngineInterface::class, EloquentSearch::class);
    }

    public function boot(Container $container): void
    {

    }
}
