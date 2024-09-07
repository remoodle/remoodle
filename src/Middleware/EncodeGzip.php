<?php

declare(strict_types=1);

namespace App\Middleware;

use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class EncodeGzip implements MiddlewareInterface
{
    public const TOKEN_HEADER = "Auth-Token";
    public const INTERNAL_CROSS_TOKEN_HEADER = 'X-Remoodle-Internal-Token';
    public const INTERNAL_CROSS_USER_HEADER = 'X-Remoodle-Moodle-Id';


    public function __construct(
        private StreamFactoryInterface $streamFactory,
    ) {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        foreach ($request->getHeader('Accept-Encoding') as $accept) {
            if ($accept === 'gzip') {
                $response = $handler->handle($request)->withAddedHeader('Content-Encoding', 'gzip');
                return $response->withBody(
                    $this->streamFactory->createStream(gzencode(
                        (string)$response->getBody()
                    ))
                );
            }
        }

        return $handler->handle($request);
    }
}
