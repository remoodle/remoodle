<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Moodle\BaseMoodleUser;
use Core\Config;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\Serializer\IgbinarySerializer;

class MoodleUser extends ModelAbstract
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
        'password_hash',
        'name_alias',
        'initialized'
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected static function boot()
    {
        parent::boot();

        static::updated(function ($user) {
            $rpc = RPC::create(Config::get("rpc.connection"));
            $factory = new Factory($rpc);
            $storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
            $storage->set($user->moodle_token, $user);
            $storage->set('m'.$user->moodle_id, $user->moodle_token);
        });

        static::created(function ($user) {
            $rpc = RPC::create(Config::get("rpc.connection"));
            $factory = new Factory($rpc);
            $storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
            $storage->set($user->moodle_token, $user);
            $storage->set('m'.$user->moodle_id, $user->moodle_token);
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

    public static function findByBarcode(string $username): ?self
    {
        return static::query()->where("username", $username)->first();
    }

    public static function findByAlias(string $nameAlias): ?self
    {
        return static::query()->where("name_alias", $nameAlias)->first();
    }

    public static function findByToken(string $token): ?self
    {
        return static::query()->where("moodle_token", $token)->first();
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

    public function eventsGroups(): HasManyThrough
    {
        return $this->hasManyThrough(
            Event::class,
            UserCourseGroup::class,
            'moodle_id',
            'group_id',
            'moodle_id',
            'group_id'
        );
    }

    public function eventsCommon(): HasManyThrough
    {
        return $this->hasManyThrough(
            Event::class,
            UserCourseAssign::class,
            'moodle_id',
            'course_id',
            'moodle_id',
            'course_id'
        )->where('group_id', 0);
    }

    public function combinedEvents(): Collection
    {
        $eventsGroupsQuery = $this->eventsGroups()->toBase();
        $eventsCommonQuery = $this->eventsCommon()->toBase();

        $combinedQuery = $eventsGroupsQuery->union($eventsCommonQuery);

        return Event::fromQuery($combinedQuery->toSql(), $combinedQuery->getBindings());
    }

    public function courseAssigns(): HasMany
    {
        return $this->hasMany(UserCourseAssign::class, "moodle_id", "moodle_id");
    }
}
