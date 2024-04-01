<?php

declare(strict_types=1);

namespace App\Modules\Notification\Providers\Mail;

use App\Modules\Notification\Message;

interface MailerInterface
{
    public function sendMail(Message $message, string $email, string $subject): void;
}
