<?php


declare(strict_types=1);

namespace App\Controllers;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Event;
use App\Modules\Moodle\Entities\Event as EventEntity;
use App\Modules\Moodle\Entities\Course as CourseEntity;
use App\Modules\Moodle\Entities\Assignment as AssignmentEntity;
use App\Modules\Moodle\Entities\Search\SearchTypeEnum;
use App\Modules\Search\SearchEngineInterface;
use Illuminate\Support\Collection;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class SearchController extends BaseController
{
    public function __construct(
        private SearchEngineInterface $searchEngine
    ) {
    }

    public function search(Request $request, Response $response): Response
    {

        $resp = $this
            ->searchEngine
            ->withMoodleId($request->getAttribute("user")->moodle_id)
            ->search($request->getParsedBody()['query'], 4);

        // print_r($resp);

        /**
         * @var Collection<Collection>
         */
        $resp = (new Collection($resp))->groupBy('type');

        // foreach ($resp as $res) {
        //     $res->related = match ($res->type) {
        //         SearchTypeEnum::ASSIGNMENT->value => Assignment::find($res->idValue)->toEntity(),
        //         SearchTypeEnum::COURSE->value => Course::find($res->idValue)->toEntity(),
        //         SearchTypeEnum::GRADE->value => Grade::findFromEntity(...explode("-", $res->idValue))->toEntity(),
        //         SearchTypeEnum::EVENT->value => Event::find($res->idValue)->toEntity(),
        //         default => null
        //     };
        // }

        $result = [];
        foreach($resp as $type => $searchables) {
            if((string)$type === SearchTypeEnum::GRADE->value) {
                continue;
            }

            $mergeTemp = match ($type) {
                SearchTypeEnum::ASSIGNMENT->value => Assignment::whereIn("assignment_id", $searchables->pluck('idValue'))
                    ->with(["relatedGrade"])
                    ->get()
                    ->map(function (Assignment $assignment): AssignmentEntity {
                        return $assignment->toEntity();
                    }),
                SearchTypeEnum::COURSE->value => Course::whereIn("course_id", $searchables->pluck('idValue'))
                    ->get()
                    ->map(function (Course $course): CourseEntity {
                        return $course->toEntity();
                    }),
                SearchTypeEnum::EVENT->value => Event::whereIn("event_id", $searchables->pluck('idValue'))
                    ->with(["assignment". "assignment.gradeEntity"])
                    ->get()
                    ->map(function (Event $event): EventEntity {
                        return $event->toEntity();
                    }),
                default => []
            };

            $result = array_merge($result, $mergeTemp->all());
        }

        return $this->jsonResponse(
            $response,
            body: $result
        );
    }

}
