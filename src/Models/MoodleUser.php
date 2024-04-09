<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\BaseMoodleUser;
use Core\Config;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

class MoodleUser extends Model
{
    protected $primaryKey = 'moodle_id';
    public $incrementing = false;
    protected $table = 'moodle_users';

    public $timestamps = false;

    protected $fillable = [
        'moodle_id',
        'name',
        'username',
        'moodle_token',
        'grades_notification',
        'deadlines_notification',
        'password_hash',
        'name_alias',
        'notify_method',
        'webhook',
        'webhook_secret',
        'initialized'
    ];

    protected $hidden = [
        'password_hash',
        'webhook_secret'
    ];

    protected static function boot()
    {
        parent::boot();

        static::updated(function ($user) {
            $rpc = RPC::create(Config::get("rpc.connection"));
            $factory = new Factory($rpc);
            $storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
            $storage->set($user->moodle_token, $user);
        });

        static::created(function ($user) {
            $rpc = RPC::create(Config::get("rpc.connection"));
            $factory = new Factory($rpc);
            $storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
            $storage->set($user->moodle_token, $user);
        });
    }

    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->password_hash);
    }

    public static function createFromBaseMoodleUser(BaseMoodleUser $moodleUser, ?string $hashedPassword = null, ?string $nameAlias = null): static
    {
        return static::create([
            'moodle_id' => $moodleUser->moodleId,
            "name" => $moodleUser->name,
            "username" => $moodleUser->username,
            "moodle_token" => $moodleUser->token,
            'password_hash' => $hashedPassword,
            'name_alias' => $nameAlias,
        ]);
    }

    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public static function findByBarcode(string $username): ?static
    {
        return static::where("username", $username)->first();
    }

    public static function findByAlias(string $nameAlias): ?static
    {
        return static::where("name_alias", $nameAlias)->first();
    }

    public static function findByToken(string $token): ?static
    {
        return static::where("moodle_token", $token)->first();
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, "moodle_id", "moodle_id");
    }

    public function courses(): HasManyThrough
    {
        return $this->hasManyThrough(
            Course::class,
            UserCourseAssign::class,
            'moodle_id',
            'course_id',
            'moodle_id',
            'course_id'
        );
    }

    public function events(): HasManyThrough
    {
        return $this->hasManyThrough(
            Event::class,
            UserCourseAssign::class,
            'moodle_id',
            'course_id',
            'moodle_id',
            'course_id'
        );
    }

    public function courseAssigns(): HasMany
    {
        return $this->hasMany(UserCourseAssign::class, "moodle_id", "moodle_id");
    }

    public function verifyCodes(): HasMany
    {
        return $this->hasMany(VerifyCode::class, "moodle_id", "moodle_id");
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, "moodle_id", "moodle_id");
    }
}
