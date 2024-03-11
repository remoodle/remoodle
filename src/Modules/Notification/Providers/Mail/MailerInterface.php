<?php 

namespace App\Notification\Providers\Mail;

use App\Notification\Message;

interface MailerInterface
{
    public function sendMail(Message $message, string $email, string $subject): void;
}