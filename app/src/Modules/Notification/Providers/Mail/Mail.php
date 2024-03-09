<?php 

namespace App\Notification\Providers\Mail;

use App\Notification\Message;
use App\Notification\MessageBag;

final class Mail
{
    public function __construct(
        private Message $message,
        private string $email,
        private MailerInterface $mailer
    ){}



    public function send(string $subject)
    {
        $this->mailer->sendMail($this->message, $this->email, $subject);
    }

}