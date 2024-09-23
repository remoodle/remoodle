<?php

declare(strict_types=1);

namespace Queue\Actions\Batch;

use App\Modules\Moodle\Entities\Event;
use GuzzleHttp\Client;
use Psr\Http\Message\ResponseInterface;
use Queue\Actions\Batch\Events\EventsBatchDto;

final class GetEventsBatch
{
    /**
     * @param string $moodleWebServicesUrl
     * @param \Queue\Actions\Batch\Events\EventsBatchDto $DTOs
     * @return array<int, array>
     */
    public function __invoke(string $moodleWebServicesUrl, EventsBatchDto ...$DTOs)
    {
        $requests = [];
        $client = new Client(['verify' => false]);
        $from = time();
        $to = time() + 604800 * 4;
        $events = [];
        foreach ($DTOs as $dto) {
            $promise = $client->requestAsync('POST', $moodleWebServicesUrl, [
                "userid" => $dto->moodleId,
                'moodlewsrestformat' => 'json',
                'wstoken' => $dto->moodleToken,
                'wsfunction' => 'core_calendar_get_action_events_by_timesort',
                "timesortfrom" => $from,
                "timesortto" => $to
            ]);

            $promise->then(function (ResponseInterface $response) use (&$events) {
                $eventsRaw = json_decode($response->getBody()->getContents(), true);
                if (array_key_exists("exception", $eventsRaw)) {
                    if (!str_contains($eventsRaw['message'], 'error/notingroup')) {
                        throw new \Exception($eventsRaw["message"]);
                    }
                }

                foreach ($eventsRaw as $event) {
                    $events[] = (array)(new Event(
                        event_id: $event['id'],
                        name: $event['name'],
                        instance: $event['instance'],
                        timestart: $event['timestart'],
                        visible: (bool)$event['visible'],
                        course_name: $event["course"]["shortname"] ?? $event["course"]["fullname"],
                        course_id: $event['course']['id']
                    ));
                }
            });

            $requests[] = $promise;
        }

        try {
            \GuzzleHttp\Promise\Utils::settle($requests)->wait();
        } catch (\Throwable $th) {
            throw $th;
        }

        return $events;
    }
}
