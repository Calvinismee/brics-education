<?php

namespace App\Support;

use App\Models\Course;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TutorCourseResolver
{
    public static function ids($user): Collection
    {
        if (! $user) {
            return collect();
        }

        $courseIds = collect();

        if ($user->mentor_course_id) {
            $courseIds->push((int) $user->mentor_course_id);
        }

        if (Schema::hasTable('course_tutor')) {
            $courseIds = $courseIds->merge(
                DB::table('course_tutor')
                    ->where('tutor_id', $user->id)
                    ->pluck('course_id')
                    ->map(fn ($courseId) => (int) $courseId)
            );
        }

        return $courseIds->filter()->unique()->values();
    }

    public static function query($user)
    {
        return Course::query()->whereIn('id', self::ids($user));
    }

    public static function sync(User $tutor, iterable $courseIds): void
    {
        $courseIds = collect($courseIds)
            ->filter()
            ->map(fn ($courseId) => (int) $courseId)
            ->unique()
            ->values();

        $tutor->forceFill([
            'mentor_course_id' => $courseIds->first(),
        ])->save();

        if (! Schema::hasTable('course_tutor')) {
            return;
        }

        $query = DB::table('course_tutor')->where('tutor_id', $tutor->id);

        if ($courseIds->isEmpty()) {
            $query->delete();
        } else {
            $query->whereNotIn('course_id', $courseIds)->delete();
        }

        $now = now();

        foreach ($courseIds as $courseId) {
            DB::table('course_tutor')->updateOrInsert(
                [
                    'course_id' => $courseId,
                    'tutor_id' => $tutor->id,
                ],
                [
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    public static function isAssigned(int $tutorId, int $courseId): bool
    {
        $legacyCourseId = DB::table('users')
            ->where('id', $tutorId)
            ->value('mentor_course_id');

        if ((int) $legacyCourseId === $courseId) {
            return true;
        }

        return Schema::hasTable('course_tutor')
            && DB::table('course_tutor')
                ->where('tutor_id', $tutorId)
                ->where('course_id', $courseId)
                ->exists();
    }

    public static function currentWeekScheduleLabel($user, int $courseId): string
    {
        if (! $user) {
            return 'Belum ada jadwal minggu ini';
        }

        $weekStart = Carbon::now()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $weekEnd = Carbon::now()->endOfWeek(Carbon::SUNDAY)->endOfDay();

        $labels = Schedule::query()
            ->where('mentor_id', $user->id)
            ->where('course_id', $courseId)
            ->visibleToTutor()
            ->whereBetween('start_time', [$weekStart, $weekEnd])
            ->orderBy('start_time')
            ->get(['start_time', 'end_time'])
            ->map(function (Schedule $schedule) {
                if (! $schedule->start_time || ! $schedule->end_time) {
                    return null;
                }

                return $schedule->start_time->copy()->locale('id')->translatedFormat('D, j M').' '.$schedule->start_time->format('H:i').' - '.$schedule->end_time->format('H:i');
            })
            ->filter()
            ->unique()
            ->values();

        return $labels->isNotEmpty()
            ? $labels->implode(' / ')
            : 'Belum ada jadwal minggu ini';
    }
}
