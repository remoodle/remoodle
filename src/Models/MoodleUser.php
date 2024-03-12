<?php

namespace App\Models;

use App\Modules\Moodle\BaseMoodleUser;
use Carbon\Carbon;
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
        'barcode',
        'moodle_token',
        'grades_notification',
        'deadlines_notification',
        'password_hash',
        'name_alias',
        'email',
        'email_verified_at',
        'notify_method',
        'webhook',
        'webhook_secret'
    ];  

    protected $hidden = [
        'password_hash',
        'webhook_secret'
    ];

    protected static function boot()
    {
        parent::boot();

        static::updated(function ($user) {
            $rpc = RPC::create('tcp://127.0.0.1:6001');
            $factory = new Factory($rpc);        
            $storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
            $storage->set($user->moodle_token, $user);
        });

        static::created(function($user){
            $rpc = RPC::create('tcp://127.0.0.1:6001');
            $factory = new Factory($rpc);        
            $storage = $factory->withSerializer(new IgbinarySerializer())->select('users');
            $storage->set($user->moodle_token, $user);
        });
    }

    public function verifyPassword(string $password): bool
    {
        return $this->password_hash === static::hashPassword($password);
    }

    public static function createFromBaseMoodleUser(BaseMoodleUser $moodleUser, ?string $hashedPassword = null, ?string $nameAlias = null, ?string $email = null): static
    {
        return static::create([
            'moodle_id' => $moodleUser->moodleId,
            "name" => $moodleUser->name,
            "barcode" => $moodleUser->barcode,
            "moodle_token" => $moodleUser->token,
            'password_hash' => $hashedPassword,
            'name_alias' => $nameAlias,
            'email' => $email
        ]);
    }

    public static function hashPassword(string $password): string
    {
        return hash("sha256", $password . Config::get("app.password_salt"));
    }

    public static function findByBarcode(string $barcode): ?static
    {
        return static::where("barcode", $barcode)->first();
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

    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function verifyEmail(): void
    {
        $this->update([
            'email_verified_at' => Carbon::now()
        ]);
    } 
}