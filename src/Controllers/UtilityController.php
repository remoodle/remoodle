<?php

namespace App\Controllers;

use App\Modules\Moodle\Moodle;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class UtilityController extends BaseController
{
    public function generateToken(Request $request, Response $response): Response
    {
        $body = (array)$request->getParsedBody();
        return $this->jsonResponse($response, 201, [
            'token' => Moodle::generateToken(
                username: $body['username'],
                password: $body['password']
            )
        ]);
    }
}
