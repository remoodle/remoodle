<?php 

return [
    "algo" => "aes-128-gcm",
    "key" => getEnvVar('CRYPT_KEY') ?? null
];