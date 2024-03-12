<?php

namespace App\Modules\Notification;
use Core\CommonContracts\Arrayable;

class Message implements Arrayable
{
    public function __construct(
        public readonly int $moodleId,
        public readonly string $message,
        public readonly int $time,
        public readonly ?AttachmentBag $attachmentBag = null,
        public readonly bool $forceEmail = false
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