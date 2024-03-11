<?php 

namespace App\Notification\Providers;

use App\Notification\MessageBag;
use GuzzleHttp\Client;

final class Webhook
{
    const USER_AGENT = "RemoodleBot (like TwitterBot)";
    const AUTH_HEADER = "X-Remoodle-Bot-Api-Secret-Token";

    public function __construct(
        private string $id,
        private string $url,
        private MessageBag $messageBag,
        private ?string $secret = null 
    ){}

    public function sendRequest(): void
    {
        $client = new Client([
            "verify" => false,
            "cookies" => false
        ]);

        $client->post($this->url, [
            "headers" => $this->getHeaders(),
            "json" => $this->messageBag->toArray()
        ]);
    }

    private function getHeaders(): array
    {
        $headers = [
            "User-Agent" => static::USER_AGENT
        ];

        if($this->secret){
            $headers[static::AUTH_HEADER] = $this->secret;
        }

        return $headers;
    }
}