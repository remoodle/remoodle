<?php

namespace App\Models;

use App\Modules\Moodle\BaseMoodleUser;
use Illuminate\Database\Eloquent\Model;

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
        'deadlines_notification'
    ];  

    public static function createFromBaseMoodleUser(BaseMoodleUser $moodleUser): static
    {
        return static::create([
            'moodle_id' => $moodleUser->moodleId,
            "name" => $moodleUser->name,
            "barcode" => $moodleUser->barcode,
            "moodle_token" => $moodleUser->token,
        ]);
    }
}