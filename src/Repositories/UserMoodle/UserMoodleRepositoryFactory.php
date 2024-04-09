<?php

declare(strict_types=1);

namespace App\Repositories\UserMoodle;

use Psr\Container\ContainerInterface;

class UserMoodleRepositoryFactory
{
    public function __construct(
        protected ContainerInterface $container
    ) {
    }

    /**
     * @param \App\Repositories\UserMoodle\RepositoryTypes $repositoryType
     * @return \App\Repositories\UserMoodle\UserMoodleRepositoryInterface
     */
    public function create(RepositoryTypes $repositoryType): UserMoodleRepositoryInterface
    {
        return $this->get($repositoryType->value);
    }

    /**
     * @template T
     * @param class-string<T> $id
     * @return T
     */
    protected function get(string $id): mixed
    {
        return $this->container->get($id);
    }
}
