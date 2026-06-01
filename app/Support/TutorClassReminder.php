<?php

namespace App\Support;

use App\Models\Notification;
use App\Models\Schedule;
use Illuminate\Support\Carbon;

class TutorClassReminder
{
    public const LEAD_MINUTES = 10;

    public function sendDueReminders(?Carbon $now = null): int
    {
        $now = ($now ?? Carbon::now('Asia/Jakarta'))->copy()->setTimezone('Asia/Jakarta');
        $targetStart = $now->copy()->addMinutes(self::LEAD_MINUTES)->startOfMinute();
        $targetEnd = $targetStart->copy()->endOfMinute();
        $createdCount = 0;

        Schedule::query()
            ->with(['course:id,title', 'mentor:id,tutor_settings'])
            ->whereIn('type', Schedule::MEETING_TYPES)
            ->whereNotNull('mentor_id')
            ->whereBetween('start_time', [
                $targetStart->format('Y-m-d H:i:s'),
                $targetEnd->format('Y-m-d H:i:s'),
            ])
            ->get()
            ->each(function (Schedule $schedule) use (&$createdCount) {
                if (! $schedule->mentor || ! TutorSettings::forUser($schedule->mentor)['notifications']['classReminder']) {
                    return;
                }

                $typeLabel = $schedule->type === Schedule::TYPE_CONSULTATION
                    ? 'Konsultasi'
                    : 'Live class';
                $courseTitle = $schedule->course?->title ?? $schedule->title;
                $date = $schedule->start_time?->locale('id')->translatedFormat('l, j F Y');
                $time = $schedule->start_time?->format('H:i');

                $notification = Notification::firstOrCreate(
                    [
                        'user_id' => $schedule->mentor_id,
                        'title' => 'Pengingat kelas 10 menit lagi',
                        'message' => "{$typeLabel} \"{$courseTitle}\" dimulai pada {$date} pukul {$time}.",
                    ],
                    [
                        'is_read' => DatabaseBoolean::value(false),
                    ]
                );

                if ($notification->wasRecentlyCreated) {
                    AdminNotificationCache::forgetForUser((int) $schedule->mentor_id);
                    $createdCount++;
                }
            });

        return $createdCount;
    }
}
