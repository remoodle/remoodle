<?php 

namespace Queue\Handlers;

use App\Models\MoodleUser;
use App\Modules\Notification\MessageBag;
use App\Modules\Notification\Providers\Webhook;

class WebhookAction extends BaseHandler
{
    public function handle(): void
    {
        /**@var \App\Notification\MessageBag */
        $messageBag = igbinary_unserialize($this->receivedTask->getPayload());

        if(! $messageBag instanceof MessageBag){
            $this->receivedTask->fail('Not correct object');
            return;
        }

        if(! $messageBag->isStrictUser()){
            $this->receivedTask->fail("Message Bag is not strict");
        }

        $user = MoodleUser::find($messageBag->getMoodleId());
        if($user === null){
            $this->receivedTask->fail("User not found.");
            return;
        }

        if($user->webhook === null){
            $this->receivedTask->fail("User has no webhook set.");
            return;
        }

        $webhook = new Webhook($user->moodle_id, $user->webhook, $messageBag, $user->webhook_secret);
        try {
            $webhook->sendRequest();
        } catch (\Throwable $th) {
            //throw $th;
            $this->receivedTask->fail($th);
        }
        $this->receivedTask->complete();
    }
}