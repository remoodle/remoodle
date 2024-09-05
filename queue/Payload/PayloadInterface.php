<?php


declare(strict_types=1);

namespace Queue\Payload;

interface PayloadInterface extends \Stringable
{
    /**
     * @return string
     */
    public function queue(): string;

    /**
     * @return mixed
     */
    public function payload(): mixed;

    /**
     * @return ?PayloadInterface
     */
    public function next(): ?PayloadInterface;

    /**
     * @return PayloadInterface[]
     */
    public function bus(): array;

    public function add(PayloadInterface $payloadInterface): static;

    public function __toString(): string;
}
