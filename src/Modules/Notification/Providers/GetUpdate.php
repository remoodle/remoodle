<?php

declare(strict_types=1);

namespace App\Modules\Notification\Providers;

use App\Modules\Notification\MessageBag;

final class GetUpdate
{
    public function __construct(
        private MessageBag $messageBag
    ) {
    }

    public function getUpdates(): array
    {
        return $this->messageBag->toArray();
    }
}
