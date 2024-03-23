<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface;

abstract class BaseController
{
    protected function transformResponse(
        ResponseInterface $response,
        int $status = 200,
        string $body = '',
        array $headers = []
    ): ResponseInterface{
        $response->getBody()->write($body);
        $response = $response->withStatus($status);
        foreach($headers as $headerName=>$headerValue){
            $response = $response->withHeader($headerName, $headerValue);
        }

        return $response;
    }

    protected function jsonResponse(
        ResponseInterface $response,
        int $status = 200,
        object|array|string $body = ''
    ): ResponseInterface{
        $body = is_string($body) ? $body : json_encode($body);
        return $this->transformResponse(
            response: $response, 
            status: $status, 
            body: $body, 
            headers: ['Content-Type' => 'application/json']
        );
    }
}