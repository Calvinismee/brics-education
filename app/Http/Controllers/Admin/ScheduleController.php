<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $schedules = Schedule::query()
            ->with(['tutor:id,name', 'mentor:id,name'])
            ->orderBy('schedule_date')
            ->orderBy('start_time')
            ->get()
            ->map(function (Schedule $schedule) {
                $startTime = null;
                $endTime = null;

                if ($schedule->start_time instanceof \DateTimeInterface) {
                    $startTime = $schedule->start_time->format('H:i');
                } elseif (is_string($schedule->start_time) && !empty($schedule->start_time)) {
                    $startTime = date('H:i', strtotime($schedule->start_time));
                }

                if ($schedule->end_time instanceof \DateTimeInterface) {
                    $endTime = $schedule->end_time->format('H:i');
                } elseif (is_string($schedule->end_time) && !empty($schedule->end_time)) {
                    $endTime = date('H:i', strtotime($schedule->end_time));
                }

                return [
                    'id' => $schedule->id,
                    'course' => $schedule->course ?: $schedule->title ?: '-',
                    'tutor_id' => $schedule->tutor_id,
                    'tutor' => $schedule->tutor?->name ?? $schedule->mentor?->name ?? 'Tutor',
                    'day' => $schedule->day,
                    'schedule_date' => optional($schedule->schedule_date)->format('Y-m-d'),
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'time' => trim($startTime . ' - ' . $endTime),
                    'students' => $schedule->students_count,
                    'meeting_link' => $schedule->meeting_link,
                    'status' => $schedule->status,
                ];
            });

        $today = now()->startOfDay();

        return Inertia::render('Admin/Schedule', [
            'schedules' => $schedules,
            'tutors' => User::query()
                ->whereIn('role', ['mentor', 'tutor'])
                ->orderBy('name')
                ->get(['id', 'name']),
            'stats' => [
                'totalClasses' => $schedules->count(),
                'upcomingClasses' => Schedule::query()
                    ->where('status', 'scheduled')
                    ->whereDate('schedule_date', '>=', $today)
                    ->count(),
                'activeInstructors' => Schedule::query()
                    ->whereNotNull('tutor_id')
                    ->distinct('tutor_id')
                    ->count('tutor_id'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'day' => ['required', 'string', 'max:20'],
            'schedule_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'students_count' => ['required', 'integer', 'min:0'],
            'meeting_link' => ['required', 'string', 'max:1024'],
            'status' => ['required', 'in:scheduled,ongoing,completed,canceled'],
        ]);

        $payload = $this->buildPayload($validated);

        Schedule::create($payload);

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil ditambahkan.');
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $validated = $request->validate([
            'course' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'day' => ['required', 'string', 'max:20'],
            'schedule_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'students_count' => ['required', 'integer', 'min:0'],
            'meeting_link' => ['required', 'string', 'max:1024'],
            'status' => ['required', 'in:scheduled,ongoing,completed,canceled'],
        ]);

        $schedule->update($this->buildPayload($validated));

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil diperbarui.');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil dihapus.');
    }

    private function buildPayload(array $validated): array
    {
        $startTime = Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'] . ' ' . $validated['start_time']);
        $endTime = Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'] . ' ' . $validated['end_time']);

        return [
            'course' => $validated['course'],
            'tutor_id' => $validated['tutor_id'] ?? null,
            'mentor_id' => $validated['tutor_id'] ?? null,
            'title' => $validated['course'],
            'meeting_link' => $validated['meeting_link'] ?? null,
            'day' => $validated['day'],
            'schedule_date' => $validated['schedule_date'],
            'start_time' => $startTime,
            'end_time' => $endTime,
            'students_count' => $validated['students_count'],
            'status' => $validated['status'],
        ];
    }
}
