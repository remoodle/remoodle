<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'uuid';
    public $timestamps = false;

    protected $fillable = [
        'uuid',
        'moodle_id',
        'title',
        'message',
        'attachments',
    ];

    public function moodleUser()
    {
        return $this->belongsTo(MoodleUser::class, 'moodle_id', 'moodle_id');
    }
}
