<?php

declare(strict_types=1);

namespace Queue\Actions\Batch;

use GuzzleHttp\Client;
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
        $from = time() - 604800;
        $to = time() + 604800 * 7;
        foreach ($DTOs as $dto) {
            $promise = $client->requestAsync('GET', $moodleWebServicesUrl, [
                'query' => [
                    'moodlewsrestformat' => 'json',
                    'wstoken' => $dto->moodleToken,
                    'wsfunction' => 'core_calendar_get_action_events_by_timesort',
                    "timesortfrom" => $from,
                    "timesortto" => $to
                ]
            ]);

            $requests[] = $promise;
        }

        $events = [];

        try {
            $results = \GuzzleHttp\Promise\Utils::settle($requests)->wait(true);

            foreach ($results as $result) {
                if ($result['state'] === 'fulfilled') {
                    $response = $result['value'];
                    $eventsRaw = json_decode($response->getBody()->getContents(), true);
                    if (array_key_exists("exception", $eventsRaw)) {
                        if (!str_contains($eventsRaw['message'], 'error/notingroup')) {
                            throw new \Exception($eventsRaw["message"]);
                        }
                    }

                    foreach ($eventsRaw['events'] as $event) {
                        $events[] = [
                            'event_id' => $event['id'],
                            'name' => $event['name'],
                            'instance' => $event['instance'],
                            'timestart' => $event['timestart'],
                            'visible' => (bool) $event['visible'],
                            'course_name' => $event["course"]["shortname"] ?? $event["course"]["fullname"],
                            'course_id' => $event['course']['id'],
                            'group_id' => $event['groupid'] ?? 0
                        ];
                    }

                }
            }
        } catch (\Throwable $th) {
            throw $th;
        }

        return $events;
    }
}
