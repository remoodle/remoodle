<?php 

namespace App\Modules\Notification;
use Core\CommonContracts\Arrayable;
use Iterator;

class MessageBag implements Arrayable, Iterator
{
    protected array $messages = [];
    private int $position = 0;
    
    private ?int $moodleId = null;

    public function __construct(
        protected bool $strictUser = true, 
        protected bool $forceEmail, 
        ...$messages
    ){
        foreach($messages as $message){
            if($message instanceof Message){
                if($strictUser && $this->moodleId === null){
                    $this->moodleId = $message->getMoodleId();
                }

                $this->messages[] = $message;
            }else{
                throw new \Exception("Message should be instance of " . Message::class . ".");
            }
        }

        if($strictUser){
            $this->moodleId = $messages[0]->getMoodleId();
        }
    }

    public function isForceEmail(): bool
    {
        return $this->forceEmail;
    }

    public function getMoodleId(): ?int
    {
        return $this->moodleId;
    }

    public function isStrictUser(): bool
    {
        return $this->strictUser;
    }

    public function addMessage(Message $message)
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