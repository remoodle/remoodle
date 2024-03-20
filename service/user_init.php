<?php

use App\Models\MoodleUser;
use Core\Config;
use Illuminate\Database\Capsule\Manager as Capsule;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

require_once __DIR__ . "/../vendor/autoload.php";

Config::loadConfigs();

$capsule = new Capsule;
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$capsule->bootEloquent();

$rpc = RPC::create(Config::get("rpc.connection"));
$factory = new Factory($rpc);
$users = MoodleUser::all()->keyBy('moodle_id');
$storage = $factory->withSerializer(new IgbinarySerializer())->select('users');

foreach($users as $user){
    $storage->set($user->moodle_token, $user);
}
