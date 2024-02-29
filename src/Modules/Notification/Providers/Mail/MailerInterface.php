<?php 

namespace App\Notification\Providers\Mail;

use App\Notification\MessageBag;

interface MailerInterface
{
    public function sendMail(MessageBag $messageBag, string $email, string $subject): void;
}