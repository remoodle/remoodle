<?php

use Core\Config;
use Dotenv\Dotenv;

require_once __DIR__ . "/vendor/autoload.php";
$dotenv = Dotenv::createImmutable(__DIR__ . "/");
$dotenv->load();

$encryptionPassword = base64_decode(Config::get("crypt.key"));


$encryptor = new \Phlib\Encrypt\Encryptor\OpenSsl($encryptionPassword);
$myData    = 'some sensitive data which needs encrypting';


// $encryptor could be a completely different instance here,
// so long as it is initialised with the same encryption password
echo $encryptor->decrypt($encryptor->encrypt($myData));