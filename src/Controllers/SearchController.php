<?php


declare(strict_types=1);

namespace App\Controllers;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Event;
use App\Models\Grade;
use App\Modules\Moodle\Entities\Search\SearchTypeEnum;
use App\Modules\Search\SearchEngineInterface;
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

        foreach ($resp as $res) {
            $res->related = match ($res->type) {
                SearchTypeEnum::ASSIGNMENT->value => Assignment::find($res->idValue)->toEntity(),
                SearchTypeEnum::COURSE->value => Course::find($res->idValue)->toEntity(),
                SearchTypeEnum::GRADE->value => Grade::find($res->idValue)->toEntity(),
                SearchTypeEnum::EVENT->value => Event::find($res->idValue)->toEntity(),
                default => null
            };
        }

        return $this->jsonResponse(
            $response,
            body: $resp
        );
    }

}
