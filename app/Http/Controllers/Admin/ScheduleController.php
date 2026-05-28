<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use App\Support\AdminNotifier;
use App\Support\TutorCourseResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $courses = DB::table('courses')
            ->select('id', 'title')
            ->orderBy('title')
            ->get();
        $courseTitles = $courses->pluck('title', 'id');
        $schedules = Schedule::query()
            ->select('id', 'course_id', 'mentor_id', 'title', 'type', 'meeting_link', 'start_time', 'end_time')
            ->with(['course:id,title', 'mentor:id,name'])
            ->orderBy('start_time')
            ->get();

        $schedules = $schedules->map(function (Schedule $schedule) use ($courseTitles) {
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
                'course' => $schedule->course?->title ?? ($courseTitles[$schedule->course_id] ?? '-'),
                'course_id' => $schedule->course_id,
                'class_title' => $schedule->title,
                'tutor_id' => $schedule->mentor_id,
                'tutor' => $schedule->mentor?->name ?? 'Tutor',
                'type' => $this->scheduleType($schedule),
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
            'courses' => $courses,
            'tutors' => User::query()
                ->whereIn('role_id', [
                    $roles['mentor'] ?? ($roles['tutor'] ?? 2),
                    $roles['tutor'] ?? 2,
                ])
                ->orderBy('name')
                ->get(['id', 'name', 'mentor_course_id'])
                ->map(function (User $tutor) use ($courseTitles) {
                    $courseIds = TutorCourseResolver::ids($tutor);

                    return [
                        'id' => $tutor->id,
                        'name' => $tutor->name,
                        'mentor_course_id' => $tutor->mentor_course_id,
                        'course_ids' => $courseIds->all(),
                        'course_titles' => $courseIds
                            ->map(fn (int $courseId) => $courseTitles[$courseId] ?? null)
                            ->filter()
                            ->values()
                            ->all(),
                    ];
                }),
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
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'course' => ['nullable', 'string', 'max:255'],
            'tutor_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', Rule::in(Schedule::TYPES)],
            'schedule_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'meeting_link' => ['nullable', 'url', 'max:1024'],
        ]);

        $courseId = $this->resolveCourseId($validated);

        $schedule = Schedule::create($this->buildPayload(
            $validated,
            $courseId,
            $validated['tutor_id'] ?? null
        ));
        AdminNotifier::scheduleCreated($schedule);

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil ditambahkan.');
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'course' => ['nullable', 'string', 'max:255'],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'type' => ['required', Rule::in(Schedule::TYPES)],
            'schedule_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'meeting_link' => ['nullable', 'url', 'max:1024'],
        ]);

        $courseId = $this->resolveCourseId($validated, $schedule->course_id ? (int) $schedule->course_id : null);
        $mentorId = array_key_exists('tutor_id', $validated) ? $validated['tutor_id'] : $schedule->mentor_id;

        $schedule->update($this->buildPayload(
            $validated,
            $courseId,
            $mentorId
        ));
        AdminNotifier::scheduleUpdated($schedule->refresh());

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil diperbarui.');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil dihapus.');
    }

    private function buildPayload(array $validated, int $courseId, ?int $mentorId): array
    {
        $startTime = Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['start_time']);
        $endTime = Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['end_time']);
        $courseTitle = DB::table('courses')->where('id', $courseId)->value('title');

        if (! $courseTitle) {
            throw ValidationException::withMessages([
                'course_id' => 'Course tidak ditemukan.',
            ]);
        }

        if ($endTime->lessThanOrEqualTo($startTime)) {
            throw ValidationException::withMessages([
                'end_time' => 'Jam selesai harus setelah jam mulai.',
            ]);
        }

        $this->ensureMentorCanTeachCourse($mentorId, $courseId);

        return [
            'course_id' => $courseId,
            'mentor_id' => $mentorId,
            'title' => $courseTitle,
            'type' => $validated['type'] ?? 'live',
            'meeting_link' => in_array($validated['type'] ?? 'live', Schedule::MEETING_TYPES, true) && filled($validated['meeting_link'] ?? null)
                ? $validated['meeting_link']
                : null,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
    }

    private function resolveCourseId(array $validated, ?int $fallbackCourseId = null): int
    {
        if (! empty($validated['course_id'])) {
            return (int) $validated['course_id'];
        }

        if (! empty($validated['course'])) {
            $courseId = DB::table('courses')
                ->where('title', $validated['course'])
                ->value('id');

            if ($courseId) {
                return (int) $courseId;
            }

            throw ValidationException::withMessages([
                'course' => 'Course tidak ditemukan.',
            ]);
        }

        if ($fallbackCourseId) {
            return $fallbackCourseId;
        }

        throw ValidationException::withMessages([
            'course_id' => 'Course wajib dipilih.',
        ]);
    }

    private function ensureMentorCanTeachCourse(?int $mentorId, int $courseId): void
    {
        if (! $mentorId) {
            return;
        }

        $mentor = User::query()->find($mentorId);

        if (! $mentor) {
            return;
        }

        $assignedCourseIds = TutorCourseResolver::ids($mentor);

        if ($assignedCourseIds->isEmpty()) {
            TutorCourseResolver::sync($mentor, [$courseId]);

            return;
        }

        if (! $assignedCourseIds->contains($courseId)) {
            throw ValidationException::withMessages([
                'tutor_id' => 'Tutor belum ditugaskan untuk course ini. Assign course tutor dari menu Users terlebih dahulu.',
            ]);
        }
    }

    private function scheduleType(Schedule $schedule): string
    {
        if (in_array($schedule->type, Schedule::TYPES, true)) {
            return $schedule->type;
        }

        $title = strtolower($schedule->title);

        return match (true) {
            str_contains($title, 'deadline') => 'deadline',
            str_contains($title, 'review') => 'review',
            str_contains($title, 'konsultasi') || str_contains($title, 'consult') => 'consultation',
            default => 'live',
        };
    }
}
