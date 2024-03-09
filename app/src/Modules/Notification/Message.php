<?php

namespace App\Notification;
use Core\CommonContracts\Arrayable;

class Message implements Arrayable
{
    public function __construct(
        protected int $moodleId,
        protected string $message,
        protected int $time,
        protected ?AttachmentBag $attachmentBag,
        protected bool $forceEmail = false
    ){}

    public function toArray(): array
    {
        return [
            "moodle_id" => $this->moodleId,
            "message" => $this->message,
            "time" => $this->time,
            "attachments" => $this->attachmentBag?->toArray()
        ];
    }

    public function getMoodleId(): int
    {
        return $this->moodleId;
    }

    public function isForceEmail(): bool
    {
        return $this->forceEmail;
    }
}