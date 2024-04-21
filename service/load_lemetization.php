<?php

declare(strict_types=1);
use App\Models\MoodleUser;
use Core\Config;
use Illuminate\Database\Capsule\Manager as Capsule;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

require_once __DIR__ . "/../vendor/autoload.php";

Config::loadConfigs();

$capsule = new Capsule();
$capsule->addConnection(Config::get('eloquent'));
$capsule->setAsGlobal();
$capsule->bootEloquent();

$rpc = RPC::create(Config::get("rpc.connection"));
$factory = new Factory($rpc);
$storage = $factory->withSerializer(new IgbinarySerializer())->select('lemmetization');

$lemmetizationMap = json_decode(file_get_contents(__DIR__ . "/files/lemmatizedMap.json"), true);
// print_r($lemmetizationMap);
// $storage->setMultiple($lemmetizationMap);
$storage->set("lemme_map", $lemmetizationMap);
