<?php 

namespace App\Notification;
use Core\CommonContracts\Arrayable;
use Iterator;

class MessageBag implements Arrayable, Iterator
{
    protected array $messages = [];
    private int $position = 0;
    
    public function __construct(...$messages)
    {
        foreach($messages as $message){
            if($message instanceof Message){
                $this->messages[] = $message;
            }else{
                throw new \Exception("Message should be instance of " . Message::class . ".");
            }
        }
    }

    public function withMessage(Message $message)
    {
        $this->messages[] = $message;
    }

    public function getMessages(): array
    {
        return $this->messages;
    }

    public function toArray(): array
    {
        $messagesBagArray = [];
        foreach($this as $message){
            $messagesBagArray[] = $message->toArray();
        }

        return $messagesBagArray;
    }

    public function rewind(): void
    {
        $this->position = 0;
    }

    public function current(): Message
    {
        return $this->messages[$this->position];
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
        return isset($this->messages[$this->position]);
    }
}