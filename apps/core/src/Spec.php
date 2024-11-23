<?php

declare(strict_types=1);

namespace App;

use OpenApi\Attributes as OAT;

#[OAT\Info(title: 'ReMoodle Core', version: '1.0', description:'ReMoodle Core API description')]
#[OAT\Server(
    url: "{url}",
    variables: [
        new OAT\ServerVariable('url', default: 'http://localhost:8000')
    ]
)]
#[OAT\SecurityScheme(
    securityScheme: "AuthToken",
    type: "apiKey",
    in: "header",
    name: "Auth-Token",
    description: "Standard authentication token for authorized requests. If not provided, both X-Remoodle-Internal-Token and X-Remoodle-Moodle-Id headers must be used."
)]
#[OAT\SecurityScheme(
    securityScheme: "InternalCrossAuth",
    type: "apiKey",
    in: "header",
    name: "X-Remoodle-Internal-Token",
    description: "Alternative to Auth-Token for cross-service requests. Requires both X-Remoodle-Internal-Token and X-Remoodle-Moodle-Id headers."
)]
#[OAT\SecurityScheme(
    securityScheme: "InternalCrossUser",
    type: "apiKey",
    in: "header",
    name: "X-Remoodle-Moodle-Id",
    description: "User ID associated with the cross-service request. Used together with X-Remoodle-Internal-Token."
)]
#[OAT\Response(
    response: 'ErrorResponse',
    description: 'Error response',
    content: new OAT\JsonContent(
        properties: [
            new OAT\Property('code', type: 'integer'),
            new OAT\Property('error', type: 'string')
        ]
    )
)]
class Spec
{
}
