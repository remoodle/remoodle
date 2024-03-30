<?php

namespace App\Modules\Notification\Providers\Mail;

use App\Modules\Notification\Message;
use App\Modules\Notification\MessageBag;

final class Mail
{
    public function __construct(
        private Message $message,
        private string $email,
        private MailerInterface $mailer
    ) {
    }

    public function send(string $subject)
    {
        $this->mailer->sendMail($this->message, $this->email, $subject);
    }

}
