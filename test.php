<?php

use App\Models\MoodleUser;
use App\Modules\Moodle\Moodle;
use Carbon\Carbon;
use Core\Config;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Connection;

require_once __DIR__ . "/vendor/autoload.php";

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

Config::loadConfigs();

/**@var Core\Container */
$container = require __DIR__ . "/bootstrap/container-laravel.php";

// $capsule = new Capsule($container);
// $capsule->addConnection(Config::get('eloquent'));
// $capsule->setAsGlobal();

// $capsule->bootEloquent();
// $container->bind(Connection::class, function () use ($capsule) {
//     return $capsule->getConnection();
// });

$user = MoodleUser::first();
$moodle = Moodle::createFromToken($user->moodle_token, $user->moodle_id);
dump($moodle->getWrapper()->getAssignments([4371]));

// $courseModulesUpsert = [];
// $courseGradesUpsert = [];

// foreach($user->courseAssigns as $courseAssign) {
//     [$courseModules, $courseGrades, $gradeEntities] = getCourseModulesAndGrades($courseAssign->course_id, $moodle);
//     $courseModulesUpsert = array_merge($courseModulesUpsert, $courseModules);
//     $courseGradesUpsert = array_merge($courseGradesUpsert, $courseGrades);
// }

// $connection = $capsule->getConnection();

// $connection->beginTransaction();

// dump($courseGradesUpsert[0]);

// $connection
// ->table("grades")
// ->insert(
//     $courseGradesUpsert[0],
// );


// try {
//     $connection
//         ->table("course_modules")
//         ->upsert($courseModulesUpsert, "cmid");
//     $connection
//         ->table("grades")
//         ->upsert(
//             $courseGradesUpsert,
//             ["moodle_id", "grade_id"],
//             ["percentage", "graderaw", "feedbackformat", "feedback"]
//         );
//     $connection->commit();
// } catch (\Throwable $th) {
//     $connection->rollBack();
//     throw $th;
// }

// dump($courseGradesUpsert, $courseModulesUpsert);

// function getCourseModulesAndGrades(int $courseId, Moodle $moodle): array
// {
//     $courseGrades = $moodle->getCourseGrades($courseId);
//     $courseGradesFiltered = [];

//     $courseModulesUpsertArray = [];
//     $courseGradesUpsertArray = [];

//     foreach($courseGrades as $courseGrade) {
//         $courseGradesFiltered[] = $courseGrade;
//         $courseGradesUpsertArray[] = (array) $courseGrade;
//         if($courseGrade->cmid === null) {
//             continue;
//         }

//         $courseModulesUpsertArray[] = [
//             "cmid" => $courseGrade->cmid,
//             "course_id" => $courseId,
//         ];
//     }

//     return [$courseModulesUpsertArray, $courseGradesUpsertArray, $courseGradesFiltered];
// }

// class Pipe
// {
//     public function __construct(
//         private mixed $value
//     ) {
//     }

//     public function __call($name, $arguments = []): Pipe
//     {
//         switch ($name) {
//             case '_':
//                 if(!isset($arguments[0]) || !is_callable($arguments[0])) {
//                     throw new Exception("idi nah");
//                 }

//                 $this->value = $arguments[0]($this->value);
//                 break;
//             case 'echo':
//                 echo (string) $this->value;
//                 break;
//             default:
//                 $this->value = call_user_func($name, $this->value, ...$arguments);
//                 break;
//         }

//         return $this;
//     }
// }

// function pipe(mixed $value): Pipe
// {
//     return new Pipe($value);
// }

// pipe("  hello   ")
//     ->trim()
//     ->_(fn (string $var) => "HUI :" . $var)
//     ->echo();
