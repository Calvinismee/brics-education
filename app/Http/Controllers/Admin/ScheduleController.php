<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\Schedule;
use App\Models\User;
use App\Support\AdminNotifier;
use App\Support\DatabaseBoolean;
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
        $packages = DB::table('packages')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        $courseTitles = $courses->pluck('title', 'id');
        $packageNames = $packages->pluck('name', 'id');
        $schedules = Schedule::query()
            ->select('id', 'course_id', 'package_id', 'mentor_id', 'title', 'type', 'audience', 'meeting_link', 'action_link', 'start_time', 'end_time')
            ->with(['course:id,title', 'package:id,name', 'mentor:id,name'])
            ->orderBy('start_time')
            ->get();

        $schedules = $schedules->map(function (Schedule $schedule) use ($courseTitles, $packageNames) {
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
            $type = $this->scheduleType($schedule);
            $subject = $type === Schedule::TYPE_TRYOUT
                ? ($schedule->package?->name ?? ($packageNames[$schedule->package_id] ?? 'Paket tryout'))
                : ($schedule->course?->title ?? ($courseTitles[$schedule->course_id] ?? '-'));

            return [
                'id' => $schedule->id,
                'course' => $subject,
                'course_id' => $schedule->course_id,
                'package' => $schedule->package?->name,
                'package_id' => $schedule->package_id,
                'class_title' => $schedule->title,
                'tutor_id' => $schedule->mentor_id,
                'tutor' => $schedule->mentor?->name ?? '-',
                'type' => $type,
                'audience' => $schedule->audience ?: Schedule::audienceForType($schedule->type),
                'day' => $dayName,
                'schedule_date' => $scheduleDate,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'deadline_time' => $endTime,
                'time' => $this->timeLabel($type, $startTime, $endTime),
                'meeting_link' => $schedule->meeting_link,
                'action_link' => $schedule->action_link,
                'status' => 'scheduled',
            ];
        });

        $roles = DB::table('roles')->pluck('id', 'name');

        return Inertia::render('Admin/Schedule', [
            'schedules' => $schedules,
            'courses' => $courses,
            'packages' => $packages,
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
            'package_id' => ['nullable', 'integer', 'exists:packages,id', 'required_if:type,'.Schedule::TYPE_TRYOUT],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'type' => ['required', Rule::in(Schedule::ADMIN_CREATABLE_TYPES)],
            'schedule_date' => ['required', 'date'],
            'start_time' => [
                'nullable',
                Rule::requiredIf(fn () => ! Schedule::hasDeadlineOnly($request->input('type'))),
                'date_format:H:i',
            ],
            'end_time' => [
                'nullable',
                Rule::requiredIf(fn () => ! Schedule::hasDeadlineOnly($request->input('type'))),
                'date_format:H:i',
            ],
            'deadline_time' => [
                'nullable',
                Rule::requiredIf(fn () => Schedule::hasDeadlineOnly($request->input('type'))),
                'date_format:H:i',
            ],
            'meeting_link' => ['nullable', 'url', 'max:1024'],
            'action_link' => ['nullable', 'url', 'max:1024', 'required_if:type,'.Schedule::TYPE_TRYOUT],
        ]);

        $courseId = $validated['type'] === Schedule::TYPE_TRYOUT
            ? null
            : $this->resolveCourseId($validated);
        $packageId = $validated['type'] === Schedule::TYPE_TRYOUT
            ? (int) $validated['package_id']
            : null;

        $schedule = Schedule::create($this->buildPayload(
            $validated,
            $courseId,
            $packageId,
            $validated['tutor_id'] ?? null
        ));
        AdminNotifier::scheduleCreated($schedule);
        $this->notifyStudentsAboutSchedule($schedule, 'created');

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil ditambahkan.');
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'course' => ['nullable', 'string', 'max:255'],
            'package_id' => ['nullable', 'integer', 'exists:packages,id', 'required_if:type,'.Schedule::TYPE_TRYOUT],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'type' => ['required', Rule::in(Schedule::TYPES)],
            'schedule_date' => ['required', 'date'],
            'start_time' => [
                'nullable',
                Rule::requiredIf(fn () => ! Schedule::hasDeadlineOnly($request->input('type'))),
                'date_format:H:i',
            ],
            'end_time' => [
                'nullable',
                Rule::requiredIf(fn () => ! Schedule::hasDeadlineOnly($request->input('type'))),
                'date_format:H:i',
            ],
            'deadline_time' => [
                'nullable',
                Rule::requiredIf(fn () => Schedule::hasDeadlineOnly($request->input('type'))),
                'date_format:H:i',
            ],
            'meeting_link' => ['nullable', 'url', 'max:1024'],
            'action_link' => ['nullable', 'url', 'max:1024', 'required_if:type,'.Schedule::TYPE_TRYOUT, 'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE],
        ]);

        $courseId = $validated['type'] === Schedule::TYPE_TRYOUT
            ? null
            : $this->resolveCourseId($validated, $schedule->course_id ? (int) $schedule->course_id : null);
        $packageId = $validated['type'] === Schedule::TYPE_TRYOUT
            ? (int) $validated['package_id']
            : null;
        $mentorId = array_key_exists('tutor_id', $validated) ? $validated['tutor_id'] : $schedule->mentor_id;

        $schedule->update($this->buildPayload(
            $validated,
            $courseId,
            $packageId,
            $mentorId
        ));
        AdminNotifier::scheduleUpdated($schedule->refresh());
        $this->notifyStudentsAboutSchedule($schedule, 'updated');

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil diperbarui.');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        $this->notifyStudentsAboutSchedule($schedule, 'deleted');
        $schedule->delete();

        return redirect()->route('admin.schedule')->with('success', 'Jadwal kelas berhasil dihapus.');
    }

    private function buildPayload(array $validated, ?int $courseId, ?int $packageId, ?int $mentorId): array
    {
        $type = $validated['type'] ?? Schedule::TYPE_LIVE;
        $isStudentDeadline = $type === Schedule::TYPE_STUDENT_DEADLINE;
        $isDeadlineOnly = Schedule::hasDeadlineOnly($type);
        $startTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['schedule_date'].' '.($isStudentDeadline ? '00:00' : ($isDeadlineOnly ? $validated['deadline_time'] : $validated['start_time']))
        );
        $endTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['schedule_date'].' '.($isDeadlineOnly ? $validated['deadline_time'] : $validated['end_time'])
        );
        $courseTitle = $courseId ? DB::table('courses')->where('id', $courseId)->value('title') : null;
        $packageName = $packageId ? DB::table('packages')->where('id', $packageId)->value('name') : null;

        if ($type === Schedule::TYPE_TRYOUT && ! $packageName) {
            throw ValidationException::withMessages([
                'package_id' => 'Paket tryout tidak ditemukan.',
            ]);
        }

        if ($type !== Schedule::TYPE_TRYOUT && ! $courseTitle) {
            throw ValidationException::withMessages([
                'course_id' => 'Course tidak ditemukan.',
            ]);
        }

        if (! $isDeadlineOnly && $endTime->lessThanOrEqualTo($startTime)) {
            throw ValidationException::withMessages([
                'end_time' => 'Jam selesai harus setelah jam mulai.',
            ]);
        }

        if ($type !== Schedule::TYPE_TRYOUT && ! $mentorId) {
            throw ValidationException::withMessages([
                'tutor_id' => 'Tutor wajib dipilih untuk tipe jadwal ini.',
            ]);
        }

        if ($courseId) {
            $this->ensureMentorCanTeachCourse($mentorId, $courseId);
        }

        return [
            'course_id' => $courseId,
            'package_id' => $packageId,
            'mentor_id' => $mentorId,
            'title' => $type === Schedule::TYPE_TRYOUT ? 'Tryout '.$packageName : $courseTitle,
            'type' => $type,
            'audience' => Schedule::audienceForType($type),
            'meeting_link' => Schedule::needsMeetingLink($type) && filled($validated['meeting_link'] ?? null)
                ? $validated['meeting_link']
                : null,
            'action_link' => Schedule::needsActionLink($type) && filled($validated['action_link'] ?? null)
                ? $validated['action_link']
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
            str_contains($title, 'tryout') => Schedule::TYPE_TRYOUT,
            str_contains($title, 'tugas') => Schedule::TYPE_STUDENT_DEADLINE,
            str_contains($title, 'deadline') => 'deadline',
            str_contains($title, 'review') => 'review',
            str_contains($title, 'konsultasi') || str_contains($title, 'consult') => 'consultation',
            default => 'live',
        };
    }

    private function timeLabel(string $type, ?string $startTime, ?string $endTime): string
    {
        return match ($type) {
            Schedule::TYPE_REVIEW => 'Review '.$endTime,
            Schedule::TYPE_TUTOR_DEADLINE, Schedule::TYPE_STUDENT_DEADLINE => 'Deadline '.$endTime,
            default => trim($startTime.' - '.$endTime),
        };
    }

    private function notifyStudentsAboutSchedule(Schedule $schedule, string $event): void
    {
        if (($schedule->audience ?: Schedule::audienceForType($schedule->type)) === Schedule::AUDIENCE_TUTOR) {
            return;
        }

        $schedule->loadMissing(['course:id,title', 'package:id,name']);
        $studentIds = $this->studentIdsForSchedule($schedule);
        $typeLabel = match ($schedule->type) {
            Schedule::TYPE_CONSULTATION => 'konsultasi',
            Schedule::TYPE_STUDENT_DEADLINE => 'deadline tugas',
            Schedule::TYPE_TRYOUT => 'tryout',
            default => 'live class',
        };
        [$title, $verb] = match ($event) {
            'updated' => ['Jadwal diperbarui', 'diperbarui'],
            'deleted' => ['Jadwal dibatalkan', 'dibatalkan'],
            default => ['Jadwal baru', 'ditambahkan'],
        };

        foreach ($studentIds as $studentId) {
            Notification::create([
                'user_id' => $studentId,
                'title' => $title,
                'message' => ucfirst($typeLabel).' '.$schedule->title.' untuk '.$this->scheduleSubject($schedule).' telah '.$verb.'.',
                'is_read' => DatabaseBoolean::value(false),
            ]);
        }
    }

    private function studentIdsForSchedule(Schedule $schedule)
    {
        return Enrollment::query()
            ->when(
                $schedule->type === Schedule::TYPE_TRYOUT,
                fn ($query) => $query->where('package_id', $schedule->package_id),
                fn ($query) => $query->where('course_id', $schedule->course_id)
            )
            ->where('status', 'active')
            ->pluck('user_id')
            ->unique();
    }

    private function scheduleSubject(Schedule $schedule): string
    {
        return $schedule->type === Schedule::TYPE_TRYOUT
            ? ($schedule->package?->name ?? 'paket tryout')
            : ($schedule->course?->title ?? 'course UTBK');
    }
}
