<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $courses = DB::table('courses')->pluck('title', 'id');
        $schedules = Schedule::query()
            ->select('id', 'course_id', 'mentor_id', 'title', 'meeting_link', 'start_time', 'end_time')
            ->with('mentor:id,name')
            ->orderBy('start_time')
            ->paginate(20)
            ->withQueryString();

        $schedules->getCollection()->transform(function (Schedule $schedule) use ($courses) {
            $startTime = $schedule->start_time instanceof \DateTimeInterface
                ? $schedule->start_time->format('H:i')
                : (is_string($schedule->start_time) && $schedule->start_time !== ''
                    ? date('H:i', strtotime($schedule->start_time))
                    : null);

            $endTime = $schedule->end_time instanceof \DateTimeInterface
                ? $schedule->end_time->format('H:i')
                : (is_string($schedule->end_time) && $schedule->end_time !== ''
                    ? date('H:i', strtotime($schedule->end_time))
                    : null);

            $scheduleDate = $schedule->start_time instanceof \DateTimeInterface
                ? $schedule->start_time->format('Y-m-d')
                : (is_string($schedule->start_time) && $schedule->start_time !== ''
                    ? Carbon::parse($schedule->start_time)->format('Y-m-d')
                    : null);

            $dayName = $schedule->start_time instanceof \DateTimeInterface
                ? $schedule->start_time->locale('id')->translatedFormat('l')
                : ($scheduleDate ? Carbon::parse($scheduleDate)->locale('id')->translatedFormat('l') : '');

            return [
                'id' => $schedule->id,
                'course' => $schedule->title ?: ($courses[$schedule->course_id] ?? '-'),
                'course_id' => $schedule->course_id,
                'tutor_id' => $schedule->mentor_id,
                'tutor' => $schedule->mentor?->name ?? 'Tutor',
                'day' => $dayName,
                'schedule_date' => $scheduleDate,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'time' => trim($startTime.' - '.$endTime),
                'meeting_link' => $schedule->meeting_link,
                'status' => 'scheduled',
            ];
        });

        $roles = DB::table('roles')->pluck('id', 'name');

        return Inertia::render('Admin/Schedule', [
            'schedules' => $schedules,
            'tutors' => User::query()
                ->whereIn('role_id', [
                    $roles['mentor'] ?? ($roles['tutor'] ?? 2),
                    $roles['tutor'] ?? 2,
                ])
                ->orderBy('name')
                ->get(['id', 'name', 'mentor_course_id']),
            'stats' => [
                'totalClasses' => Schedule::count(),
                'upcomingClasses' => Schedule::query()
                    ->where('start_time', '>=', now())
                    ->count(),
                'activeInstructors' => Schedule::query()
                    ->whereNotNull('mentor_id')
                    ->distinct('mentor_id')
                    ->count('mentor_id'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'schedule_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'meeting_link' => ['required', 'string', 'max:1024'],
        ]);

        Schedule::create($this->buildPayload($validated));

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil ditambahkan.');
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $validated = $request->validate([
            'course' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'schedule_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'meeting_link' => ['required', 'string', 'max:1024'],
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
        $startTime = Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['start_time']);
        $endTime = Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['end_time']);
        $courseId = DB::table('courses')->where('title', $validated['course'])->value('id');

        if (! $courseId) {
            throw ValidationException::withMessages([
                'course' => 'Course tidak ditemukan.',
            ]);
        }

        $this->ensureMentorCanTeachCourse($validated['tutor_id'] ?? null, (int) $courseId);

        return [
            'course_id' => $courseId,
            'mentor_id' => $validated['tutor_id'] ?? null,
            'title' => $validated['course'],
            'meeting_link' => $validated['meeting_link'] ?? null,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
    }

    private function ensureMentorCanTeachCourse(?int $mentorId, int $courseId): void
    {
        if (! $mentorId) {
            return;
        }

        $mentorCourseId = DB::table('users')
            ->where('id', $mentorId)
            ->value('mentor_course_id');

        if ($mentorCourseId === null) {
            DB::table('users')
                ->where('id', $mentorId)
                ->update([
                    'mentor_course_id' => $courseId,
                    'updated_at' => now(),
                ]);

            return;
        }

        if ((int) $mentorCourseId !== $courseId) {
            throw ValidationException::withMessages([
                'tutor_id' => 'Mentor hanya dapat mengajar course yang ditugaskan.',
            ]);
        }
    }
}
