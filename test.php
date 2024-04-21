<?php

use Carbon\Carbon;
use Fugikzl\MoodleWrapper\Moodle;

require_once __DIR__ . "/vendor/autoload.php";

$moodle = new Moodle(
    "https://moodle.astanait.edu.kz/webservice/rest/server.php",
    "1bbec94f1df5c1090f56d7d26f7a9b27",
    8597
);

// $from = $from ?? time();
// $to ??= time() + (3600 * 24 * 7);
$s = $moodle->getAssignments([4499]);

$moodle = new Moodle(
    "https://moodle.astanait.edu.kz/webservice/rest/server.php",
    "a0be324caf20104ff784e88a24db4edf",
    8798
);

// $from = $from ?? time();
// $to ??= time() + (3600 * 24 * 7);
$n = $moodle->getAssignments([4499]);

dump($s, $n);
