<?php

declare(strict_types=1);

namespace Queue\Actions\Batch;

use App\Modules\Moodle\Entities\Grade;
use GuzzleHttp\Client;
use Psr\Http\Message\ResponseInterface;

final class GetGradesBatch
{
    public function __construct(
        private readonly string $moodleWebservicesUrl
    ) {
    }

    /**
     * @param string $token
     * @param int $moodleUserId
     * @param int $courseIds
     * @return Grade[]
     */
    public function __invoke(string $token, int $moodleUserId, int ...$courseIds): array
    {
        $client = new Client(['verify' => false]);
        $requests = [];
        $grades = [];
        foreach ($courseIds as $courseId) {
            $promise = $client->requestAsync('POST', $this->moodleWebservicesUrl, [
                'query' => [
                    "courseid" => $courseId,
                    "userid" => $moodleUserId,
                    'moodlewsrestformat' => 'json',
                    'wstoken' => $token,
                    'wsfunction' => 'gradereport_user_get_grade_items'
                ],
            ]);

            $promise->then(function (ResponseInterface $response) use (&$grades, $moodleUserId, $courseId) {
                $rawGrades = json_decode($response->getBody()->getContents(), true);
                if (array_key_exists("exception", $rawGrades)) {
                    if (!str_contains($rawGrades['message'], 'error/notingroup')) {
                        throw new \Exception($rawGrades["message"]);
                    }
                }
                foreach ($rawGrades["usergrades"][0]['gradeitems'] as $gradeitem) {
                    if ($gradeitem['itemtype'] === 'category') {
                        continue;
                    }

                    if ($gradeitem['itemtype'] === 'course' && ($grades['cmid'] ?? null) === null) {
                        $gradeitem['itemname'] = 'Total';
                    }

                    $gradeitem['percentageformatted'] = str_replace([' ', '%'], '', $gradeitem['percentageformatted']);
                    $grade = is_numeric($gradeitem['percentageformatted'])
                        ? (int) $gradeitem['percentageformatted']
                        : null
                    ;

                    if (isset($gradeitem['graderaw'])) {
                        $gradeitem['graderaw'] = round((float) $gradeitem['graderaw'], 3);
                    }

                    $grades[] = (new Grade(
                        grade_id: $gradeitem['id'],
                        course_id: $courseId,
                        cmid: $gradeitem['cmid'] ?? null,
                        name: $gradeitem['itemname'] ?? "",
                        percentage: $grade,
                        moodle_id: $moodleUserId,
                        itemtype: $gradeitem['itemtype'],
                        itemmodule: $gradeitem['itemmodule'],
                        iteminstance: $gradeitem['iteminstance'],
                        grademin: $gradeitem['grademin'],
                        grademax: $gradeitem['grademax'],
                        feedbackformat: $gradeitem['feedbackformat'],
                        graderaw: $gradeitem['graderaw'],
                        feedback: $gradeitem['feedback'],
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
        return $grades;
    }

}
