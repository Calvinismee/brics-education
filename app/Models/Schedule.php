<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'mentor_id',
        'title',
        'course',
        'tutor_id',
        'day',
        'schedule_date',
        'start_time',
        'end_time',
        'students_count',
        'meeting_link',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'schedule_date' => 'date',
            'students_count' => 'integer',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }
}
