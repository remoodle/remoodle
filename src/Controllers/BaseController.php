<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface;

abstract class BaseController
{
    /**
     * @param \Psr\Http\Message\ResponseInterface $response
     * @param int $status
     * @param string $body
     * @param array<string, string> $headers
     * @return \Psr\Http\Message\ResponseInterface
     */
    protected function transformResponse(
        ResponseInterface $response,
        int $status = 200,
        string $body = '',
        array $headers = []
    ): ResponseInterface {
        $response->getBody()->write($body);
        $response = $response->withStatus($status);
        foreach($headers as $headerName => $headerValue) {
            $response = $response->withHeader($headerName, $headerValue);
        }

        return $response;
    }

    /**
     * @param \Psr\Http\Message\ResponseInterface $response
     * @param int $status
     * @param object|mixed[]|string $body
     * @throws \Exception
     * @return \Psr\Http\Message\ResponseInterface
     */
    protected function jsonResponse(
        ResponseInterface $response,
        int $status = 200,
        object|array|string $body = '{}'
    ): ResponseInterface {
        $body = is_string($body) ? $body : json_encode($body);

        if(!$body) {
            throw new \Exception("Invalid body porvided. Can't encode to json.");
        }

        return $this->transformResponse(
            response: $response,
            status: $status,
            body: $body,
            headers: ['Content-Type' => 'application/json']
        );
    }
}
