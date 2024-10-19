<?php

declare(strict_types=1);

namespace Core;

use Illuminate\Container\Container as LaravelContainer;

class Container extends LaravelContainer
{
    /**
     * @param string $id
     * @return bool
     */
    public function has(string $id): bool
    {
        if(!$this->bound($id)) {
            try {
                $this->resolve($id);
            } catch (\Throwable $th) {
                return false;
            }
        }

        return true;
    }

    /**
    * @template T
    * @param class-string<T> $id
    * @throws \Psr\Container\NotFoundExceptionInterface
    * @throws \Psr\Container\ContainerExceptionInterface
    * @return T
    */
    public function get(string $id)
    {
        return parent::get($id);
    }


    /**
     * @param class-string<\Core\ServiceProvider\ServiceProviderInterface> $provider
     * @return void
     */
    public function loadProvider(string $provider): void
    {
        $provider = $this->get($provider);
        $provider->register($this);
    }
}
