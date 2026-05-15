<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Schedule;
use Inertia\Inertia;

class TutorHistoryController extends Controller
{
    public function index()
    {
        $history = Schedule::query()
            ->with(['course:id,title', 'mentor:id,name,email'])
            ->whereNotNull('mentor_id')
            ->whereNotNull('meeting_link')
            ->whereNotNull('started_at')
            ->whereColumn('started_at', '<=', 'end_time')
            ->where('end_time', '<', now())
            ->orderByDesc('end_time')
            ->paginate(15)
            ->withQueryString();

        $history->getCollection()->transform(fn (Schedule $schedule) => [
            'id' => $schedule->id,
            'title' => $schedule->title,
            'course' => $schedule->course?->title ?? 'Course',
            'tutor' => [
                'id' => $schedule->mentor?->id,
                'name' => $schedule->mentor?->name ?? 'Tutor',
                'email' => $schedule->mentor?->email,
            ],
            'date' => $schedule->start_time?->locale('id')->translatedFormat('l, j F Y'),
            'dateShort' => $schedule->start_time?->locale('id')->translatedFormat('j M Y'),
            'time' => $schedule->start_time?->format('H:i').' - '.$schedule->end_time?->format('H:i'),
            'students' => Enrollment::query()
                ->where('course_id', $schedule->course_id)
                ->where('status', 'active')
                ->count(),
            'meeting_link' => $schedule->meeting_link,
            'started_at' => $schedule->started_at,
            'ended_at' => $schedule->end_time,
        ]);

        $tutorSummaries = Schedule::query()
            ->with(['course:id,title', 'mentor:id,name,email'])
            ->whereNotNull('schedules.mentor_id')
            ->whereNotNull('schedules.meeting_link')
            ->whereNotNull('schedules.started_at')
            ->whereColumn('schedules.started_at', '<=', 'schedules.end_time')
            ->where('schedules.end_time', '<', now())
            ->get()
            ->groupBy('mentor_id')
            ->map(function ($schedules) {
                $mentor = $schedules->first()->mentor;

                return [
                    'id' => $mentor?->id,
                    'name' => $mentor?->name ?? 'Tutor',
                    'email' => $mentor?->email,
                    'totalSessions' => $schedules->count(),
                    'lastTaughtAt' => $schedules->max('end_time'),
                    'courses' => $schedules
                        ->pluck('course.title')
                        ->filter()
                        ->unique()
                        ->values()
                        ->implode(', '),
                ];
            })
            ->sortByDesc('totalSessions')
            ->values();

        return Inertia::render('Admin/TutorHistory', [
            'history' => $history,
            'tutorSummaries' => $tutorSummaries,
            'stats' => [
                'totalSessions' => Schedule::query()
                    ->whereNotNull('mentor_id')
                    ->whereNotNull('meeting_link')
                    ->whereNotNull('started_at')
                    ->whereColumn('started_at', '<=', 'end_time')
                    ->where('end_time', '<', now())
                    ->count(),
                'activeTutors' => Schedule::query()
                    ->whereNotNull('mentor_id')
                    ->whereNotNull('meeting_link')
                    ->whereNotNull('started_at')
                    ->whereColumn('started_at', '<=', 'end_time')
                    ->where('end_time', '<', now())
                    ->distinct('mentor_id')
                    ->count('mentor_id'),
                'thisMonth' => Schedule::query()
                    ->whereNotNull('mentor_id')
                    ->whereNotNull('meeting_link')
                    ->whereNotNull('started_at')
                    ->whereColumn('started_at', '<=', 'end_time')
                    ->where('end_time', '<', now())
                    ->whereMonth('end_time', now()->month)
                    ->whereYear('end_time', now()->year)
                    ->count(),
            ],
        ]);
    }
}
