<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Repositories\UserMoodle\DatabaseUserMoodleRepositoryInterface;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;
use Slim\Routing\RouteContext;

class CourseAssign implements MiddlewareInterface
{
    public function __construct(
        protected DatabaseUserMoodleRepositoryInterface $databaseUserMoodleRepository
    ) {
    }

    /**
     *
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Server\RequestHandlerInterface $handler
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $routeArguments = RouteContext::fromRequest($request)->getRoute()->getArguments();
        $user = $request->getAttribute("user");

        if ($user === null) {
            $this->throwUnauthorizedException();
        }

        if (!$this
            ->databaseUserMoodleRepository
            ->isUserAssignedToCourse($user->moodle_id, (int) $routeArguments['course'])
        ) {
            $this->throwUnauthorizedException();
        }

        return $handler->handle($request);
    }

    /**
     * @throws \Exception
     * @return void
     */
    protected function throwUnauthorizedException(): void
    {
        throw new \Exception("User not permitted", StatusCodeInterface::STATUS_UNAUTHORIZED);
    }
}
