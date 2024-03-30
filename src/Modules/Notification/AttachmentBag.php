<?php

namespace App\Modules\Notification;

use Core\CommonContracts\Arrayable;
use Iterator;

class AttachmentBag implements Arrayable, Iterator
{
    protected array $attachments = [];
    private int $position = 0;

    public function __construct(...$attachments)
    {
        foreach($attachments as $attachment) {
            if($attachment instanceof Attachment) {
                $this->attachments[] = $attachment;
            } else {
                throw new \Exception("Attachment should be instance of " . Attachment::class . ".");
            }
        }
    }

    public function withAttachment(Attachment $attachment)
    {
        $this->attachments[] = $attachment;
    }

    public function getAttachments(): array
    {
        return $this->attachments;
    }

    public function toArray(): array
    {
        $attachmentsBagArray = [];
        foreach($this as $attachment) {
            $attachmentsBagArray[] = $attachment->toArray();
        }

        return $attachmentsBagArray;
    }

    public function rewind(): void
    {
        $this->position = 0;
    }

    public function current(): Attachment
    {
        return $this->attachments[$this->position];
    }

    public function key(): mixed
    {
        return $this->position;
    }

    public function next(): void
    {
        ++$this->position;
    }

    public function valid(): bool
    {
        return isset($this->attachments[$this->position]);
    }
}
