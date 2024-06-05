<?php

declare(strict_types=1);

namespace App\GRPC;

use App\GRPC\Auth\Auth;
use App\Models\MoodleUser;
use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use GetDeadlinesRequest;
use GetDeadlinesResponse;
use RemoodleServiceInterface;
use Spiral\RoadRunner\GRPC\ContextInterface;

class Remoodle implements RemoodleServiceInterface
{
    public function __construct(
        private DatabaseUserMoodleRepositoryInterface $databaseUserMoodleRepository
    ) {
    }

    public function GetDeadlines(ContextInterface $ctx, GetDeadlinesRequest $in): GetDeadlinesResponse
    {
        $moodleId = $in->getMoodleId();
        $user = MoodleUser::findOrFail($moodleId);

        return new GetDeadlinesResponse(
            $this->databaseUserMoodleRepository->getDeadlines($moodleId, $user->moodle_token)
        );
    }
}
