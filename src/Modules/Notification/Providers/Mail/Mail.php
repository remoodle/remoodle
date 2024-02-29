<?php 

namespace App\Notification\Providers\Mail;

use App\Notification\MessageBag;

final class Mail
{
    public function __construct(
        private MessageBag $messageBag,
        private string $email,
        private MailerInterface $mailer
    ){
        if(!$this->isSameMoodleIdForMessageBag($messageBag)){
            throw new \Exception("Not same moodle id for messages.");
        }
    }

    public static function isSameMoodleIdForMessageBag(MessageBag $messageBag): bool
    {
        $moodleIdHead = null;
        foreach($messageBag as $message){
            $currentMoodleId = $message->getMoodleId();
            if($moodleIdHead !== null && $moodleIdHead !== $currentMoodleId){
                return false;
            }
        }

        return true;
    }

    public function send(string $subject)
    {
        $this->mailer->sendMail($this->messageBag, $this->email, $subject);
    }

}