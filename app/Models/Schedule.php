<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    public const TYPE_LIVE = 'live';

    public const TYPE_CONSULTATION = 'consultation';

    public const TYPE_TUTOR_DEADLINE = 'deadline';

    public const TYPE_REVIEW = 'review';

    public const TYPE_STUDENT_DEADLINE = 'student_deadline';

    public const TYPE_TRYOUT = 'tryout';

    public const AUDIENCE_SHARED = 'shared';

    public const AUDIENCE_TUTOR = 'tutor';

    public const AUDIENCE_STUDENT = 'student';

    public const TYPES = [
        self::TYPE_LIVE,
        self::TYPE_CONSULTATION,
        self::TYPE_TUTOR_DEADLINE,
        self::TYPE_REVIEW,
        self::TYPE_STUDENT_DEADLINE,
        self::TYPE_TRYOUT,
    ];

    public const ADMIN_CREATABLE_TYPES = [
        self::TYPE_LIVE,
        self::TYPE_CONSULTATION,
        self::TYPE_TUTOR_DEADLINE,
        self::TYPE_REVIEW,
        self::TYPE_TRYOUT,
    ];

    public const TUTOR_CREATABLE_TYPES = [
        self::TYPE_LIVE,
        self::TYPE_CONSULTATION,
        self::TYPE_STUDENT_DEADLINE,
    ];

    public const MEETING_TYPES = [self::TYPE_LIVE, self::TYPE_CONSULTATION];

    public const ACTION_LINK_TYPES = [self::TYPE_STUDENT_DEADLINE, self::TYPE_TRYOUT];

    protected $fillable = [
        'course_id',
        'mentor_id',
        'title',
        'type',
        'audience',
        'start_time',
        'end_time',
        'meeting_link',
        'action_link',
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

    public function scopeVisibleToTutor(Builder $query): Builder
    {
        return $query->whereIn('audience', [self::AUDIENCE_SHARED, self::AUDIENCE_TUTOR]);
    }

    public function scopeVisibleToStudent(Builder $query): Builder
    {
        return $query->whereIn('audience', [self::AUDIENCE_SHARED, self::AUDIENCE_STUDENT]);
    }

    public static function audienceForType(?string $type): string
    {
        return match ($type) {
            self::TYPE_TUTOR_DEADLINE, self::TYPE_REVIEW => self::AUDIENCE_TUTOR,
            self::TYPE_STUDENT_DEADLINE, self::TYPE_TRYOUT => self::AUDIENCE_STUDENT,
            default => self::AUDIENCE_SHARED,
        };
    }

    public static function needsMeetingLink(?string $type): bool
    {
        return in_array($type, self::MEETING_TYPES, true);
    }

    public static function needsActionLink(?string $type): bool
    {
        return in_array($type, self::ACTION_LINK_TYPES, true);
    }
}
