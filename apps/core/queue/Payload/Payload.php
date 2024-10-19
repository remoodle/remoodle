<?php

declare(strict_types=1);

namespace Queue\Payload;

use Stringable;

class Payload implements PayloadInterface
{
    /**
     * @param string $queue
     * @param mixed $payload
     * @param PayloadInterface[] $bus
     */
    public function __construct(
        protected string $queue,
        protected mixed $payload,
        protected array $bus = []
    ) {
    }

    public function queue(): string
    {
        return $this->queue;
    }

    public function payload(): mixed
    {
        return $this->payload;
    }

    public function next(): PayloadInterface|null
    {
        return array_key_exists(0, $this->bus)
            ? $this->bus[0]
            : null;
    }

    public function bus(): array
    {
        return $this->bus;
    }

    public function add(PayloadInterface $payloadInterface): static
    {
        $this->bus[] = $payloadInterface;
        return $this;
    }

    public function __toString(): string
    {
        return igbinary_serialize($this);
    }
}
