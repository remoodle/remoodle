<?php 

return [
    "algo" => "aes-128-gcm",
    "key" => $_ENV['CRYPT_KEY'] ?? null
];