<?php

declare(strict_types=1);

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Modules\Notification\Message;
use App\Modules\Notification\Providers\Mail\Mail;
use App\Modules\Notification\Providers\Mail\Mailers\Resend;
use Core\Config;

class SendEmail extends BaseHandler
{
    public function handle(): void
    {
        /**@var \App\Notification\Message */
        $message = igbinary_unserialize($this->receivedTask->getPayload());

        if(! $message instanceof Message) {
            $this->receivedTask->fail('Not correct object after serialization. Expected ' . Message::class . " found " . $message::class);
            return;
        }

        $user = MoodleUser::find($message->getMoodleId());
        if($user === null) {
            $this->receivedTask->fail("User not found.");
            return;
        }

        if($user->email === null) {
            $this->receivedTask->fail("User has no email set.");
            return;
        }

        $mail = new Mail($message, $user->email, new Resend(
            Config::get("notification.mail.resend.api_key"),
            Config::get("notification.mail.resend.from")
        ));

        $mail->send('ReMoodle');
        $this->receivedTask->complete();
    }

}
