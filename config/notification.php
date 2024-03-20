<?php

return [
    'mail' => [
        'resend' => [
            'api_key' => getEnvVar("RESEND_API_KEY"),
            'from' => 'info@mail.remoodle.app'
        ]
    ]
];