<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Notification;
use App\Models\Schedule;
use App\Support\AdminNotifier;
use App\Support\DatabaseBoolean;
use App\Support\TutorCourseResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $courseIds = $this->tutorCourseIds($user);
        $weekStart = Carbon::now('Asia/Jakarta')->startOfWeek(Carbon::MONDAY)->startOfDay();
        $weekEnd = Carbon::now('Asia/Jakarta')->endOfWeek(Carbon::SUNDAY)->endOfDay();

        $scheduleEvents = Schedule::query()
            ->with('course:id,title')
            ->where('mentor_id', $user->id)
            ->whereIn('course_id', $courseIds)
            ->visibleToTutor()
            ->whereBetween('start_time', [$weekStart->format('Y-m-d H:i:s'), $weekEnd->format('Y-m-d H:i:s')])
            ->orderBy('start_time')
            ->get()
            ->map(fn (Schedule $schedule) => [
                'id' => $schedule->id,
                'date' => $schedule->start_time?->locale('id')->translatedFormat('l, j F Y'),
                'dateShort' => $schedule->start_time?->locale('id')->translatedFormat('D, j M'),
                'dayKey' => $schedule->start_time?->toDateString(),
                'time' => $this->timeRange($schedule),
                'title' => $schedule->title,
                'course' => $schedule->course?->title ?? $schedule->title,
                'course_id' => $schedule->course_id,
                'students' => Enrollment::query()
                    ->where('course_id', $schedule->course_id)
                    ->where('status', 'active')
                    ->count(),
                'type' => $this->eventType($schedule),
                'audience' => $schedule->audience ?: Schedule::audienceForType($schedule->type),
                'location' => $schedule->meeting_link ? 'Online Meeting' : 'Platform Brics',
                'meeting_link' => $schedule->meeting_link,
                'action_link' => $schedule->action_link,
                'started_at' => $schedule->started_at,
                'status' => $this->scheduleStatus($schedule),
                'start_session_url' => route('tutor.schedule.start', $schedule),
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
            ]);
        $eventsByDate = $scheduleEvents->groupBy('dayKey');
        $studentDeadlines = Schedule::query()
            ->with('course:id,title')
            ->where('mentor_id', $user->id)
            ->whereIn('course_id', $courseIds)
            ->where('type', Schedule::TYPE_STUDENT_DEADLINE)
            ->orderByDesc('end_time')
            ->take(12)
            ->get()
            ->map(fn (Schedule $schedule) => [
                'id' => $schedule->id,
                'course_id' => $schedule->course_id,
                'course' => $schedule->course?->title ?? $schedule->title,
                'title' => $schedule->title,
                'schedule_date' => $schedule->end_time?->toDateString(),
                'deadline_time' => $schedule->end_time?->format('H:i'),
                'deadline_label' => $schedule->end_time?->locale('id')->translatedFormat('l, j F Y H:i'),
                'deadline_at' => $schedule->end_time,
                'action_link' => $schedule->action_link,
                'status' => $this->scheduleStatus($schedule),
            ]);
        $weekDays = collect(range(0, 6))->map(function (int $offset) use ($weekStart, $eventsByDate) {
            $date = $weekStart->copy()->addDays($offset)->locale('id');
            $dayKey = $date->toDateString();

            return [
                'date' => $date->translatedFormat('l, j F Y'),
                'dateShort' => $date->translatedFormat('D, j M'),
                'dayKey' => $dayKey,
                'isToday' => $date->isToday(),
                'events' => $eventsByDate->get($dayKey, collect())->values(),
            ];
        });

        return Inertia::render('Tutor/TutorSchedule', [
            'user' => $user,
            'tutorClasses' => Course::query()
                ->withCount([
                    'materials',
                    'materials as approved_materials_count' => fn ($query) => $query->where('approval_status', 'approved'),
                ])
                ->whereIn('id', $courseIds)
                ->orderBy('title')
                ->get()
                ->map(fn (Course $course) => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'name' => $course->title,
                    'students' => Enrollment::query()
                        ->where('course_id', $course->id)
                        ->where('status', 'active')
                        ->count(),
                    'weeklySchedule' => TutorCourseResolver::currentWeekScheduleLabel($user, $course->id),
                ]),
            'schedules' => $weekDays,
            'studentDeadlines' => $studentDeadlines,
            'week' => [
                'start' => $weekStart->toDateString(),
                'end' => $weekEnd->toDateString(),
                'label' => $weekStart->copy()->locale('id')->translatedFormat('j M').' - '.$weekEnd->copy()->locale('id')->translatedFormat('j M Y'),
            ],
            'stats' => [
                'totalThisWeek' => $scheduleEvents->count(),
                'totalLive' => $scheduleEvents->where('type', 'live')->count(),
                'totalDeadlines' => $scheduleEvents->where('type', 'deadline')->count(),
                'totalReviews' => $scheduleEvents->where('type', 'review')->count(),
                'totalConsultations' => $scheduleEvents->where('type', 'consultation')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $courseIds = $this->tutorCourseIds($request->user())->all();

        $validated = $request->validate([
            'course_id' => ['required', 'integer', Rule::in($courseIds)],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Schedule::TUTOR_CREATABLE_TYPES)],
            'schedule_date' => ['required', 'date'],
            'start_time' => ['nullable', 'required_unless:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i'],
            'end_time' => ['nullable', 'required_unless:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i', 'after:start_time'],
            'deadline_time' => ['nullable', 'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i'],
            'meeting_link' => ['nullable', 'url', 'max:1024'],
            'action_link' => ['nullable', 'url', 'max:1024', 'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE],
        ]);

        $schedule = Schedule::create($this->payload($request, $validated));
        AdminNotifier::scheduleCreated($schedule);
        $this->notifyStudentsAboutSchedule($request, $schedule, 'created');

        return redirect()->route('tutor.schedule')->with('success', 'Jadwal berhasil dibuat.');
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        abort_unless((int) $schedule->mentor_id === (int) $request->user()->id, 403);

        $courseIds = $this->tutorCourseIds($request->user())->all();

        $validated = $request->validate([
            'course_id' => ['required', 'integer', Rule::in($courseIds)],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Schedule::TUTOR_CREATABLE_TYPES)],
            'schedule_date' => ['required', 'date'],
            'start_time' => ['nullable', 'required_unless:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i'],
            'end_time' => ['nullable', 'required_unless:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i', 'after:start_time'],
            'deadline_time' => ['nullable', 'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE, 'date_format:H:i'],
            'meeting_link' => ['nullable', 'url', 'max:1024'],
            'action_link' => ['nullable', 'url', 'max:1024', 'required_if:type,'.Schedule::TYPE_STUDENT_DEADLINE],
        ]);

        $schedule->update($this->payload($request, $validated));
        AdminNotifier::scheduleUpdated($schedule->refresh());
        $this->notifyStudentsAboutSchedule($request, $schedule, 'updated');

        return redirect()->route('tutor.schedule')->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroy(Request $request, Schedule $schedule): RedirectResponse
    {
        abort_unless((int) $schedule->mentor_id === (int) $request->user()->id, 403);

        $this->notifyStudentsAboutSchedule($request, $schedule, 'deleted');
        $schedule->delete();

        return back()->with('success', 'Jadwal berhasil dihapus.');
    }

    public function updateMeetingLink(Request $request, Schedule $schedule): RedirectResponse
    {
        abort_unless((int) $schedule->mentor_id === (int) $request->user()->id, 403);
        abort_unless(TutorCourseResolver::ids($request->user())->contains((int) $schedule->course_id), 403);

        if ($this->hasEnded($schedule)) {
            return back()->withErrors([
                'meeting_link' => 'Sesi ini sudah berakhir. Link meeting tidak bisa ditambahkan atau diubah.',
            ]);
        }

        if (! in_array($this->eventType($schedule), Schedule::MEETING_TYPES, true)) {
            return back()->withErrors([
                'meeting_link' => 'Jadwal ini hanya berupa pengingat, jadi tidak membutuhkan link meeting.',
            ]);
        }

        $validated = $request->validate([
            'meeting_link' => ['nullable', 'url', 'max:1024'],
        ]);

        if ($schedule->started_at && blank($validated['meeting_link'] ?? null)) {
            return back()->withErrors([
                'meeting_link' => 'Link meeting sesi yang sudah dimulai tidak bisa dikosongkan.',
            ]);
        }

        $previousLink = $schedule->meeting_link;
        $schedule->update([
            'meeting_link' => filled($validated['meeting_link'] ?? null) ? $validated['meeting_link'] : null,
        ]);

        if ($schedule->meeting_link && $schedule->meeting_link !== $previousLink) {
            $schedule->load('course:id,title');
            $this->notifyStudentsAboutMeetingLink($request, $schedule);
        }

        return back()->with('success', 'Link meeting berhasil diperbarui.');
    }

    public function startSession(Request $request, Schedule $schedule)
    {
        abort_unless((int) $schedule->mentor_id === (int) $request->user()->id, 403);
        abort_unless(TutorCourseResolver::ids($request->user())->contains((int) $schedule->course_id), 403);

        if (! in_array($this->eventType($schedule), Schedule::MEETING_TYPES, true)) {
            return back()->withErrors([
                'schedule' => 'Jadwal ini hanya berupa pengingat dan tidak bisa dimulai sebagai sesi meeting.',
            ]);
        }

        if (blank($schedule->meeting_link)) {
            return back()->withErrors([
                'meeting_link' => 'Tambahkan link meeting terlebih dahulu sebelum memulai sesi.',
            ]);
        }

        if ($this->hasEnded($schedule)) {
            return back()->withErrors([
                'schedule' => 'Sesi ini sudah berakhir dan tidak bisa dimulai ulang.',
            ]);
        }

        if (! $schedule->started_at) {
            $schedule->update(['started_at' => Carbon::now('Asia/Jakarta')->format('Y-m-d H:i:s')]);
        }

        return redirect()->away($schedule->meeting_link);
    }

    private function payload(Request $request, array $validated): array
    {
        $type = $validated['type'];
        $isStudentDeadline = $type === Schedule::TYPE_STUDENT_DEADLINE;
        $startTime = $isStudentDeadline
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' 00:00', 'Asia/Jakarta')
            : Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['start_time'], 'Asia/Jakarta');
        $endTime = $isStudentDeadline
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['deadline_time'], 'Asia/Jakarta')
            : Carbon::createFromFormat('Y-m-d H:i', $validated['schedule_date'].' '.$validated['end_time'], 'Asia/Jakarta');

        return [
            'course_id' => $validated['course_id'],
            'mentor_id' => $request->user()->id,
            'title' => $validated['title'],
            'type' => $type,
            'audience' => Schedule::audienceForType($type),
            'start_time' => $startTime->format('Y-m-d H:i:s'),
            'end_time' => $endTime->format('Y-m-d H:i:s'),
            'meeting_link' => Schedule::needsMeetingLink($type) ? ($validated['meeting_link'] ?? null) : null,
            'action_link' => Schedule::needsActionLink($type) ? ($validated['action_link'] ?? null) : null,
        ];
    }

    private function eventType(Schedule $schedule): string
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

    private function timeRange(Schedule $schedule): string
    {
        return $schedule->start_time?->format('H:i').' - '.$schedule->end_time?->format('H:i');
    }

    private function scheduleStatus(Schedule $schedule): string
    {
        $now = Carbon::now('Asia/Jakarta');
        $start = $this->localScheduleTime($schedule->start_time);
        $end = $this->localScheduleTime($schedule->end_time);

        if ($end && $end->lessThanOrEqualTo($now)) {
            return 'completed';
        }

        if ($start && $end && $start->lessThanOrEqualTo($now) && $end->greaterThan($now)) {
            return 'in-progress';
        }

        return 'upcoming';
    }

    private function hasEnded(Schedule $schedule): bool
    {
        $end = $this->localScheduleTime($schedule->end_time);

        return $end ? $end->lessThanOrEqualTo(Carbon::now('Asia/Jakarta')) : false;
    }

    private function localScheduleTime($value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        return Carbon::parse($value->format('Y-m-d H:i:s'), 'Asia/Jakarta');
    }

    private function tutorCourseIds($user)
    {
        return TutorCourseResolver::ids($user);
    }

    private function notifyStudentsAboutMeetingLink(Request $request, Schedule $schedule): void
    {
        $studentIds = Enrollment::query()
            ->where('course_id', $schedule->course_id)
            ->where('status', 'active')
            ->pluck('user_id')
            ->unique();

        foreach ($studentIds as $studentId) {
            Notification::create([
                'user_id' => $studentId,
                'title' => 'Link live class tersedia',
                'message' => ($schedule->course?->title ?? 'Course UTBK').' - '.$request->user()->name.' sudah menambahkan link meeting untuk '.$schedule->title.'.',
                'is_read' => DatabaseBoolean::value(false),
            ]);
        }
    }

    private function notifyStudentsAboutSchedule(Request $request, Schedule $schedule, string $event): void
    {
        if (($schedule->audience ?: Schedule::audienceForType($schedule->type)) === Schedule::AUDIENCE_TUTOR) {
            return;
        }

        $schedule->loadMissing('course:id,title');
        $studentIds = Enrollment::query()
            ->where('course_id', $schedule->course_id)
            ->where('status', 'active')
            ->pluck('user_id')
            ->unique();
        $typeLabel = match ($schedule->type) {
            Schedule::TYPE_CONSULTATION => 'konsultasi',
            Schedule::TYPE_STUDENT_DEADLINE => 'deadline tugas',
            default => 'jadwal live class',
        };
        [$title, $verb] = match ($event) {
            'updated' => ['Jadwal diperbarui', 'memperbarui'],
            'deleted' => ['Jadwal dibatalkan', 'membatalkan'],
            default => ['Jadwal baru', 'menambahkan'],
        };

        foreach ($studentIds as $studentId) {
            Notification::create([
                'user_id' => $studentId,
                'title' => $title,
                'message' => ($schedule->course?->title ?? 'Course UTBK').' - '.$request->user()->name.' '.$verb.' '.$typeLabel.' '.$schedule->title.'.',
                'is_read' => DatabaseBoolean::value(false),
            ]);
        }
    }
}
