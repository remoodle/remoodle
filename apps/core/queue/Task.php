<?php


declare(strict_types=1);

use Queue\Payload\PayloadInterface;
use Spiral\RoadRunner\Jobs\Task\Task as SpiralTask;

class Task extends SpiralTask
{
    protected readonly string|\Stringable $payload;

    /**
     * @param non-empty-string $name
     * @param array<non-empty-string, array<string>> $headers
     */
    public function __construct(
        protected readonly string $name,
        PayloadInterface $payload,
        array $headers = [],
    ) {
        \assert($this->name !== '', 'Precondition [job !== ""] failed');
        $this->headers = $headers;
        $this->payload = $payload->__toString();
    }
}
