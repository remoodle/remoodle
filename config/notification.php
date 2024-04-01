<?php

declare(strict_types=1);
return [
    'mail' => [
        'resend' => [
            'api_key' => getEnvVar("RESEND_API_KEY"),
            'from' => getEnvVar("MAIL_NOTIFY_ADDRESS")
        ]
    ]
];
