<?php 

return [
    "password_salt" => getEnvVar("PASSWORD_SALT"),
    "mode" => getEnvVar("MODE", "development")
];