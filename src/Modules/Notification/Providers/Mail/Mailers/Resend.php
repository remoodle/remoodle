<?php

namespace App\Modules\Notification\Providers\Mail\Mailers;

use App\Modules\Notification\Message;
use App\Modules\Notification\Providers\Mail\MailerInterface;
use Resend as GlobalResend;
use Resend\Client;

final class Resend implements MailerInterface
{
    private Client $resendClient;

    public function __construct(
        private string $apiKey,
        private string $from
    ){
        $this->resendClient = GlobalResend::client($apiKey);
    }

    public function sendMail(Message $message, string $email, string $subject): void
    {
        $this->resendClient->emails->send([
            'from' => "ReMoodle<{$this->from}>",
            'to' => [$email],
            'subject' => $subject,
            'html' => $this->getContents($message),
        ]);
    }

    private function getContents(Message $message): string
    {
        return "<p>" . $message->toArray()["message"] . "</p><br>";
    }
}