<?php

declare(strict_types=1);

namespace App\Middleware;

use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Spiral\RoadRunner\KeyValue\StorageInterface;

final class Auth implements MiddlewareInterface
{
    public const TOKEN_HEADER = "Auth-Token";
    public const INTERNAL_CROSS_TOKEN_HEADER = 'X-Remoodle-Internal-Token';
    public const INTERNAL_CROSS_USER_HEADER = 'X-Remoodle-Moodle-Id';


    public function __construct(
        private StorageInterface $storage,
    ) {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if($this->headerHasCrossTokens($request)) {
            [$headerTokenValidStatus, $validatedRequest] = $this->crossTokenIsValid($request);
        } else {
            if(!$this->headerHasAuthToken($request)) {
                throw new \Exception(static::TOKEN_HEADER . ' header is required.', StatusCodeInterface::STATUS_UNPROCESSABLE_ENTITY);
            }

            [$headerTokenValidStatus, $validatedRequest] = $this->headerTokenIsValid($request);
        }

        if(!$headerTokenValidStatus) {
            throw new \Exception("Request is not authorized.", StatusCodeInterface::STATUS_UNAUTHORIZED);
        }

        return $handler->handle($validatedRequest);
    }


    private function crossTokenIsValid(ServerRequestInterface $request): array
    {
        if(getEnvVar('CROSS_SECRET') === null
            || $request->getHeader(static::INTERNAL_CROSS_TOKEN_HEADER)[0] !== getEnvVar('CROSS_SECRET')) {
            return [false, $request];
        }
        $userToken = $this->storage->get('m'.$request->getHeader(static::INTERNAL_CROSS_USER_HEADER)[0]);

        if(!$userToken) {
            throw new \Exception("User token is not found", StatusCodeInterface::STATUS_NOT_FOUND);
        }

        $user = $this->storage->get($userToken);
        if(!$user) {
            throw new \Exception("User is not found", StatusCodeInterface::STATUS_NOT_FOUND);
        }

        return [true, $request->withAttribute("user", $user)];
    }

    private function headerHasCrossTokens(ServerRequestInterface $request): bool
    {
        return array_key_exists(0, $request->getHeader(static::INTERNAL_CROSS_TOKEN_HEADER))
            && array_key_exists(0, $request->getHeader(static::INTERNAL_CROSS_USER_HEADER));
    }

    private function headerHasAuthToken(ServerRequestInterface $request): bool
    {
        return array_key_exists(0, $request->getHeader(static::TOKEN_HEADER));
    }

    private function headerTokenIsValid(ServerRequestInterface $request): array
    {
        $token = $request->getHeader(static::TOKEN_HEADER)[0];
        $user = $this->storage->get($token);

        if(!$user) {
            return [false, $request];
        }

        return [true, $request->withAttribute("user", $user)];
    }
}
