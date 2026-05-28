<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    public const TYPES = ['live', 'deadline', 'review', 'consultation'];

    public const MEETING_TYPES = ['live', 'consultation'];

    protected $fillable = [
        'course_id',
        'mentor_id',
        'title',
        'type',
        'start_time',
        'end_time',
        'meeting_link',
        'started_at',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'started_at' => 'datetime',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }
}
