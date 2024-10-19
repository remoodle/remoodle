<?php

declare(strict_types=1);

namespace App\Middleware;

use Exception;
use Fig\Http\Message\StatusCodeInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

class ErrorMiddleware implements MiddlewareInterface
{
    public function __construct(
        protected ResponseFactoryInterface $responseFactory
    ) {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        try {
            return $handler->handle($request);
        } catch (Exception $exception) {
            $response = match ($exception->getCode()) {
                StatusCodeInterface::STATUS_BAD_REQUEST => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_BAD_REQUEST),
                StatusCodeInterface::STATUS_UNAUTHORIZED => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_UNAUTHORIZED),
                StatusCodeInterface::STATUS_FORBIDDEN => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_FORBIDDEN),
                StatusCodeInterface::STATUS_NOT_FOUND => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_NOT_FOUND),
                StatusCodeInterface::STATUS_CONFLICT => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_CONFLICT),
                StatusCodeInterface::STATUS_METHOD_NOT_ALLOWED => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_METHOD_NOT_ALLOWED),
                StatusCodeInterface::STATUS_UNPROCESSABLE_ENTITY => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_UNPROCESSABLE_ENTITY),
                StatusCodeInterface::STATUS_SERVICE_UNAVAILABLE => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_SERVICE_UNAVAILABLE),
                default => $this->responseFactory->createResponse(StatusCodeInterface::STATUS_INTERNAL_SERVER_ERROR)
            };
        }

        $response->getBody()->write(json_encode([
            "code" => $exception->getCode(),
            "error" => $response->getStatusCode() === 500
                ? "Internal server error."
                : $exception->getMessage()
        ]));

        return $response->withHeader("Content-Type", "application/json");
    }
}
