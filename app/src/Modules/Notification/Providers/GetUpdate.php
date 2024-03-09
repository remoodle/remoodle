<?php

namespace App\Notification\Providers;

use App\Notification\MessageBag;

final class GetUpdate
{
    public function __construct(
        private MessageBag $messageBag
    ){}

    public function getUpdates(): array
    {
        return $this->messageBag->toArray();
    }
}