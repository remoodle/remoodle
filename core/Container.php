<?php 

namespace Core;

use Illuminate\Container\Container as LaravelContainer;

class Container extends LaravelContainer
{
    public function has(string $id): bool
    {
        if(!$this->bound($id)){
            try {
                $this->resolve($id);
            } catch (\Throwable $th) {
                return false;
            }
        }

        return true;
    }
}