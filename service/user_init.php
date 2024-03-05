<?php

use App\Models\MoodleUser;
use Core\Config;
use Dotenv\Dotenv;
use Illuminate\Database\Capsule\Manager as Capsule;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

require_once __DIR__ . "/../vendor/autoload.php";

$dotenv = Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();

Config::loadConfigs();

$capsule = new Capsule;
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$capsule->bootEloquent();

$rpc = RPC::create('tcp://127.0.0.1:6001');
$factory = new Factory($rpc);

$storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
$users = MoodleUser::all();

foreach($users as $user){
    $storage->set($user->moodle_token, $user);
}
