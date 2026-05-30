<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Notification;
use App\Models\Schedule;
use App\Support\TutorCourseResolver;
use App\Support\TutorSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('mentorCourse.category');
        $courseIds = $this->tutorCourseIds($user);

        $courses = Course::query()
            ->with('category')
            ->withCount([
                'materials',
                'materials as approved_materials_count' => fn ($query) => $query->where('approval_status', 'approved'),
                'schedules as tutor_schedules_count' => fn ($query) => $query
                    ->where('mentor_id', $user->id)
                    ->visibleToTutor(),
            ])
            ->whereIn('id', $courseIds)
            ->orderBy('title')
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'name' => $course->title,
                'category' => $course->category?->name,
                'students' => Enrollment::query()
                    ->where('course_id', $course->id)
                    ->where('status', 'active')
                    ->count(),
                'weeklySchedule' => TutorCourseResolver::currentWeekScheduleLabel($user, $course->id),
                'sessions' => $course->tutor_schedules_count,
            ]);

        $teachingHistory = $this->teachingHistoryQuery($user, $courseIds)
            ->take(5)
            ->get()
            ->map(fn (Schedule $schedule) => $this->teachingHistoryItem($schedule));

        $todaySchedules = Schedule::query()
            ->with('course:id,title')
            ->where('mentor_id', $user->id)
            ->whereIn('course_id', $courseIds)
            ->visibleToTutor()
            ->whereDate('start_time', Carbon::today('Asia/Jakarta')->toDateString())
            ->orderBy('start_time')
            ->get()
            ->map(fn (Schedule $schedule) => [
                'id' => $schedule->id,
                'time' => $this->timeRange($schedule),
                'course' => $schedule->course?->title ?? $schedule->title,
                'students' => Enrollment::query()
                    ->where('course_id', $schedule->course_id)
                    ->where('status', 'active')
                    ->count(),
                'status' => $this->scheduleStatus($schedule),
                'type' => $this->eventType($schedule),
                'audience' => $schedule->audience ?: Schedule::audienceForType($schedule->type),
                'meeting_link' => $schedule->meeting_link,
                'started_at' => $schedule->started_at,
                'end_time' => $schedule->end_time,
                'start_session_url' => route('tutor.schedule.start', $schedule),
            ]);

        $materials = Material::query()
            ->with('course:id,title')
            ->where('uploaded_by', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Tutor/TutorDashboard', [
            'user' => $user,
            'tutorClasses' => $courses,
            'todaySchedule' => $todaySchedules,
            'teachingHistory' => $teachingHistory,
            'notifications' => Notification::query()
                ->where('user_id', $user->id)
                ->latest()
                ->take(3)
                ->get(['id', 'title', 'message', 'is_read', 'created_at']),
            'stats' => [
                'totalStudents' => Enrollment::query()
                    ->whereIn('course_id', $courseIds)
                    ->where('status', 'active')
                    ->distinct('user_id')
                    ->count('user_id'),
                'activeClasses' => $courses->count(),
                'pendingMaterials' => Material::query()
                    ->where('uploaded_by', $user->id)
                    ->where('approval_status', 'pending')
                    ->count(),
                'upcomingSessions' => Schedule::query()
                    ->where('mentor_id', $user->id)
                    ->whereIn('course_id', $courseIds)
                    ->visibleToTutor()
                    ->where('start_time', '>=', Carbon::now('Asia/Jakarta')->format('Y-m-d H:i:s'))
                    ->count(),
                'completedSessions' => $this->teachingHistoryQuery($user, $courseIds)->count(),
            ],
        ]);
    }

    public function history(Request $request)
    {
        $user = $request->user()->load('mentorCourse.category');
        $courseIds = $this->tutorCourseIds($user);
        $history = $this->teachingHistoryQuery($user, $courseIds)
            ->paginate(12)
            ->withQueryString();

        $history->getCollection()->transform(fn (Schedule $schedule) => $this->teachingHistoryItem($schedule));

        return Inertia::render('Tutor/TutorHistory', [
            'user' => $user,
            'tutorClasses' => $this->courseSummaries($user),
            'history' => $history,
            'stats' => [
                'totalSessions' => $this->teachingHistoryQuery($user, $courseIds)->count(),
                'totalStudents' => Enrollment::query()
                    ->whereIn('course_id', $courseIds)
                    ->where('status', 'active')
                    ->distinct('user_id')
                    ->count('user_id'),
                'courses' => $courseIds->count(),
                'lastTaught' => $this->teachingHistoryQuery($user, $courseIds)->value('start_time'),
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        if ($request->has('phone')) {
            $phone = preg_replace('/\D+/', '', (string) $request->input('phone'));
            $request->merge([
                'phone' => $phone !== '' ? $phone : null,
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^\d+$/'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'expertise' => ['nullable', 'string', 'max:255'],
            'education' => ['nullable', Rule::in(['SMA', 'S1', 'S2', 'S3'])],
            'bio' => ['nullable', 'string', 'max:1000'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $user = $request->user();
        $profile = $user->tutor_profile ?? [];

        if ($request->hasFile('profile_photo')) {
            $photo = $this->storeTutorProfilePhoto($request);

            if (! empty($profile['photo_disk']) && ! empty($profile['photo_path'])) {
                Storage::disk($profile['photo_disk'])->delete($profile['photo_path']);
            }

            $profile = array_merge($profile, [
                'photo_url' => $photo['url'],
                'photo_disk' => $photo['disk'],
                'photo_path' => $photo['path'],
            ]);
        }

        $phone = $request->has('phone')
            ? ($validated['phone'] ?? null)
            : ($user->phone ?? ($profile['phone'] ?? null));

        $user->update([
            'name' => $validated['name'],
            'phone' => $request->has('phone') ? $phone : $user->phone,
            'gender' => $request->has('gender') ? ($validated['gender'] ?? null) : $user->gender,
            'tutor_profile' => array_merge($profile, [
                'phone' => $phone,
                'expertise' => $request->has('expertise') ? ($validated['expertise'] ?? null) : ($profile['expertise'] ?? null),
                'education' => $request->has('education') ? ($validated['education'] ?? null) : ($profile['education'] ?? null),
                'bio' => $request->has('bio') ? ($validated['bio'] ?? null) : ($profile['bio'] ?? null),
            ]),
        ]);

        return back()->with('success', 'Profil tutor berhasil diperbarui.');
    }

    private function storeTutorProfilePhoto(Request $request): array
    {
        $disk = config('filesystems.materials_disk', 'public');
        $file = $request->file('profile_photo');
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $filename = Str::uuid().'-profil-tutor.'.$extension;
        $path = $file->storeAs('profiles/tutors/'.$request->user()->id, $filename, $disk);

        if (! $path) {
            throw ValidationException::withMessages([
                'profile_photo' => 'Foto profil gagal disimpan. Periksa konfigurasi storage.',
            ]);
        }

        return [
            'disk' => $disk,
            'path' => $path,
            'url' => Material::publicUrlFor($disk, $path),
        ];
    }

    public function profile(Request $request)
    {
        $user = $request->user()->load('mentorCourse.category');

        return Inertia::render('Tutor/TutorProfileEdit', [
            'user' => $user,
            'tutorClasses' => $this->courseSummaries($user),
        ]);
    }

    public function settings(Request $request)
    {
        $user = $request->user()->load('mentorCourse.category');

        return Inertia::render('Tutor/TutorSettings', [
            'user' => $user,
            'tutorClasses' => $this->courseSummaries($user),
            'settings' => TutorSettings::forUser($user),
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notifications.materialReview' => ['required', 'boolean'],
            'notifications.classReminder' => ['required', 'boolean'],
            'notifications.studentQuestion' => ['required', 'boolean'],
            'notifications.weeklyReport' => ['required', 'boolean'],
            'teaching.defaultSessionDuration' => ['required', 'integer', 'min:30', 'max:240'],
            'teaching.autoPublishApprovedMaterial' => ['required', 'boolean'],
            'teaching.showProgressWarnings' => ['required', 'boolean'],
            'privacy.showEmailToStudents' => ['required', 'boolean'],
            'privacy.showRating' => ['required', 'boolean'],
            'appearance.theme' => ['required', 'string', Rule::in(['system', 'light', 'dark'])],
        ]);

        $request->user()->update([
            'tutor_settings' => array_replace_recursive(TutorSettings::defaults(), $validated),
        ]);

        return back()->with('success', 'Settings tutor berhasil disimpan.');
    }

    public function password(Request $request)
    {
        $user = $request->user()->load('mentorCourse.category');

        return Inertia::render('Tutor/TutorPassword', [
            'user' => $user,
            'tutorClasses' => $this->courseSummaries($user),
        ]);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password tutor berhasil diperbarui.');
    }

    private function courseSummaries($user)
    {
        return Course::query()
            ->withCount([
                'materials',
                'materials as approved_materials_count' => fn ($query) => $query->where('approval_status', 'approved'),
            ])
            ->whereIn('id', $this->tutorCourseIds($user))
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
            ]);
    }

    private function tutorCourseIds($user)
    {
        return TutorCourseResolver::ids($user);
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

    private function teachingHistoryQuery($user, $courseIds)
    {
        return Schedule::query()
            ->with('course:id,title')
            ->where('mentor_id', $user->id)
            ->whereIn('course_id', $courseIds)
            ->whereNotNull('meeting_link')
            ->whereNotNull('started_at')
            ->whereColumn('started_at', '<=', 'end_time')
            ->where('end_time', '<=', Carbon::now('Asia/Jakarta')->format('Y-m-d H:i:s'))
            ->orderByDesc('end_time');
    }

    private function localScheduleTime($value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        return Carbon::parse($value->format('Y-m-d H:i:s'), 'Asia/Jakarta');
    }

    private function teachingHistoryItem(Schedule $schedule): array
    {
        return [
            'id' => $schedule->id,
            'course_id' => $schedule->course_id,
            'course' => $schedule->course?->title ?? $schedule->title,
            'title' => $schedule->title,
            'date' => $schedule->start_time?->locale('id')->translatedFormat('l, j F Y'),
            'dateShort' => $schedule->start_time?->locale('id')->translatedFormat('j M Y'),
            'time' => $this->timeRange($schedule),
            'students' => Enrollment::query()
                ->where('course_id', $schedule->course_id)
                ->where('status', 'active')
                ->count(),
            'meeting_link' => $schedule->meeting_link,
            'started_at' => $schedule->started_at,
            'ended_at' => $schedule->end_time,
        ];
    }

}
