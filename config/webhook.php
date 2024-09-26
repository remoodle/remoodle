<?php

declare(strict_types=1);

return [
    'enabled' => (bool)(getEnvVar('WEBHOOK_PUSH_ENABLED', false)),
    'url' => getEnvVar('WEBHOOK_PUSH_URL', ''),
    'secret' => getEnvVar('WEBHOOK_CROSS_SECRET', ''),
];
