<?php

namespace App\Notification\Providers\Mail\Mailers;
use App\Notification\Providers\Mail\MailerInterface;
use Resend as GlobalResend;
use Resend\Client;
use App\Notification\MessageBag;

final class Resend implements MailerInterface
{
    private Client $resendClient;

    public function __construct(
        private string $apiKey,
        private string $from
    ){
        $this->resendClient = GlobalResend::client($apiKey);
    }

    public function sendMail(MessageBag $messageBag, string $email, string $subject): void
    {
        $this->resendClient->emails->send([
            'from' => "Acme <{$this->from}>",
            'to' => [$email],
            'subject' => $subject,
            'html' => $this->getContents($messageBag),
        ]);
    }

    private function getContents(MessageBag $messageBag): string
    {
        $html = "";
        foreach($messageBag as $message){
            $html .= "<p>" . $message->toArray()["message"] . "</p><br>";
        }

        return $html;
    }
}