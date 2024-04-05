<?php

declare(strict_types=1);

namespace App\Modules\Notification;

use App\Models\MoodleUser;
use App\Models\Notification;
use App\Modules\Jobs\Factory;
use App\Modules\Jobs\JobsEnum;
use Spiral\RoadRunner\Jobs\Task\Task;
use Illuminate\Support\Str;

class Bridge
{
    public function __construct(
        protected Factory $factory
    ) {
    }

    public function notify(MessageBag|Message $message, MoodleUser $moodleUser): true
    {
        if($moodleUser->notify_method === 'get_update') {
            $this->storeUserNotificationsToDatabase($message, $moodleUser);
            return true;
        }

        $queue = $this->factory->createQueue(JobsEnum::from($moodleUser->notify_method)->value);
        $queue->dispatch($queue->create(Task::class, igbinary_serialize($message)));

        return true;
    }

    protected function storeUserNotificationsToDatabase(Message|MessageBag $message, MoodleUser $moodleUser): void
    {
        $messageBagArray = [];
        if($message instanceof Message) {
            $messageBagArray[] = $this->prepareMessageToInsert($message, $moodleUser->moodle_id);
        } else {
            foreach($message as $messageInstance) {
                $messageBagArray[] = $this->prepareMessageToInsert($messageInstance, $moodleUser->moodle_id);
            }
        }

        Notification::insert($messageBagArray);
    }

    protected function prepareMessageToInsert(Message $message, int $moodleId, ?string $title = null): array
    {
        return [
            'uuid' => Str::orderedUuid(),
            'moodle_id' => $moodleId,
            'title' => $title ?? 'ReMoodle',
            'message' => $message->message,
            'attachments' => json_encode($message->attachmentBag->toArray())
        ];
    }
}
