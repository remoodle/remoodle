<?php

use App\Models\MoodleUser;
use Core\Config;
use Dotenv\Dotenv;
use Illuminate\Database\Capsule\Manager as Capsule;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

require_once __DIR__ . "/../vendor/autoload.php";

const MEMORY_PERMISSIONS = 0o600;

function id(): int
{
    $file = \tempnam(\sys_get_temp_dir(), 'shm_');
    return \ftok($file, \chr(42));
}

$dotenv = Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();

Config::loadConfigs();

$capsule = new Capsule;
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$capsule->bootEloquent();

$rpc = RPC::create(Config::get("rpc.connection"));
$factory = new Factory($rpc);

$users = MoodleUser::all()->keyBy('moodle_id');

$storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
// $id = id();
// $storage->set('shm_add', $id); //rpc storage - to receive shm addr in other workers, services
// $shm = \shm_attach($id, 3072, 0o600); //new shm

foreach($users as $user){
    $storage->set($user->moodle_token, $user);
    // echo "\nput: " . crc32($user->moodle_token);
    // \shm_put_var($shm, crc32($user->moodle_token), igbinary_serialize($user));
}
