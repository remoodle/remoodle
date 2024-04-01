<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerifyCode extends Model
{
    use HasUuids;

    protected $table = 'verify_codes';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'uuid';
    public $timestamps = true;
    public const CREATED_AT = 'created_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'uuid',
        'moodle_id',
        'code',
        'type',
        'created_at',
        'expires_at'
    ];

    public function moodleUser(): BelongsTo
    {
        return $this->belongsTo(MoodleUser::class, 'moodle_id', 'moodle_id');
    }
}
