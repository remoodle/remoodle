<?php

declare(strict_types=1);

namespace Core\CommonContracts;

interface Arrayable
{
    public function toArray(): array;
}
