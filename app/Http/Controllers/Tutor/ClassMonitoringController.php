<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Schedule;
use App\Models\User;
use App\Support\TutorCourseResolver;
use App\Support\TutorSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ClassMonitoringController extends Controller
{
    public function index(Request $request, ?string $courseSlug = null)
    {
        $user = $request->user();
        $courses = $this->tutorCourses($user);
        $selectedCourse = $this->resolveSelectedCourse($courses, $courseSlug, $request->query('course_id')) ?? $courses->first();

        if (! $courseSlug && $request->filled('course_id') && $selectedCourse) {
            return redirect()->route('tutor.classes.show', [
                'courseSlug' => $selectedCourse->slug,
            ]);
        }

        $students = collect();
        $materials = collect();

        if ($selectedCourse) {
            $students = Enrollment::query()
                ->with('user:id,name,email')
                ->where('course_id', $selectedCourse->id)
                ->where('status', 'active')
                ->orderByDesc('enrolled_at')
                ->get()
                ->map(fn (Enrollment $enrollment) => [
                    'id' => $enrollment->user?->id,
                    'slug' => Str::slug($enrollment->user?->name ?? 'siswa'),
                    'name' => $enrollment->user?->name ?? 'Siswa',
                    'email' => $enrollment->user?->email ?? '-',
                    'progress' => 0,
                    'lastActive' => $enrollment->updated_at?->diffForHumans() ?? '-',
                    'score' => 0,
                    'attendance' => 0,
                    'status' => $enrollment->status,
                ]);

            $materials = Material::query()
                ->where('course_id', $selectedCourse->id)
                ->orderByRaw("case when approval_status = 'pending' then 0 else 1 end")
                ->latest()
                ->get()
                ->map(fn (Material $material) => [
                    'id' => $material->id,
                    'title' => $material->title,
                    'type' => $this->materialType($material->type),
                    'meta' => $material->file_url ?: $material->content,
                    'status' => $material->approval_status,
                    'uploaded_by_current_tutor' => (int) $material->uploaded_by === (int) $user->id,
                    'can_delete' => true,
                    'created_at' => $material->created_at,
                ]);
        }

        return Inertia::render('Tutor/TutorClassMonitoring', [
            'user' => $user,
            'classes' => $courses->map(fn (Course $course) => $this->courseSummary($course, $user)),
            'selectedClassId' => $selectedCourse?->id,
            'students' => $students,
            'materials' => $materials,
            'settings' => TutorSettings::forUser($user),
            'stats' => [
                'totalStudents' => $students->count(),
                'avgScore' => (int) round($students->avg('score') ?? 0),
                'avgAttendance' => (int) round($students->avg('attendance') ?? 0),
                'materialCount' => $materials->count(),
            ],
        ]);
    }

    public function showStudent(Request $request, string $studentSlug)
    {
        $user = $request->user();
        $courseIds = TutorCourseResolver::ids($user);
        $student = $this->resolveStudentSlug($studentSlug, $courseIds);

        abort_if(! $student, 404);

        $enrollments = Enrollment::query()
            ->with('course.category')
            ->where('user_id', $student->id)
            ->whereIn('course_id', $courseIds)
            ->orderByDesc('enrolled_at')
            ->get();

        abort_if($enrollments->isEmpty(), 403);

        $enrolledCourseIds = $enrollments->pluck('course_id');
        $recentSchedules = Schedule::query()
            ->with('course:id,title')
            ->whereIn('course_id', $enrolledCourseIds)
            ->where('mentor_id', $user->id)
            ->visibleToTutor()
            ->orderByDesc('start_time')
            ->take(6)
            ->get()
            ->map(fn (Schedule $schedule) => [
                'id' => $schedule->id,
                'title' => $schedule->title,
                'course' => $schedule->course?->title,
                'meeting_link' => $schedule->meeting_link,
                'date' => $schedule->start_time?->locale('id')->translatedFormat('l, j F Y'),
                'time' => $schedule->start_time?->format('H:i').' - '.$schedule->end_time?->format('H:i'),
            ]);

        return Inertia::render('Tutor/TutorStudentProfile', [
            'user' => $user,
            'tutorClasses' => $this->tutorCourses($user)->map(fn (Course $course) => $this->courseSummary($course, $user)),
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'joined_at' => $student->created_at?->locale('id')->translatedFormat('j F Y'),
            ],
            'enrollments' => $enrollments->map(function (Enrollment $enrollment) use ($user) {
                $course = $enrollment->course;
                $materialCount = Material::query()->where('course_id', $enrollment->course_id)->count();
                $approvedMaterialCount = Material::query()
                    ->where('course_id', $enrollment->course_id)
                    ->where('approval_status', 'approved')
                    ->count();

                return [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'enrolled_at' => $enrollment->enrolled_at
                        ? Carbon::parse($enrollment->enrolled_at)->locale('id')->translatedFormat('j F Y')
                        : null,
                    'course' => [
                        'id' => $course?->id,
                        'title' => $course?->title,
                        'category' => $course?->category?->name,
                    ],
                    'materials' => $materialCount,
                    'approvedMaterials' => $approvedMaterialCount,
                    'progress' => $materialCount > 0 ? (int) round(($approvedMaterialCount / $materialCount) * 100) : 0,
                    'sessions' => Schedule::query()
                        ->where('course_id', $enrollment->course_id)
                        ->where('mentor_id', $user->id)
                        ->visibleToTutor()
                        ->count(),
                ];
            }),
            'recentSchedules' => $recentSchedules,
            'stats' => [
                'courses' => $enrollments->count(),
                'avgProgress' => 0,
                'avgScore' => 0,
                'avgAttendance' => 0,
            ],
        ]);
    }

    private function tutorCourses($user)
    {
        return Course::query()
            ->withCount([
                'materials',
                'materials as approved_materials_count' => fn ($query) => $query->where('approval_status', 'approved'),
                'schedules as tutor_schedules_count' => fn ($query) => $query
                    ->where('mentor_id', $user->id)
                    ->visibleToTutor(),
            ])
            ->whereIn('id', TutorCourseResolver::ids($user))
            ->orderBy('title')
            ->get();
    }

    private function courseSummary(Course $course, $user): array
    {
        return [
            'id' => $course->id,
            'slug' => $course->slug,
            'title' => $course->title,
            'name' => $course->title,
            'students' => Enrollment::query()
                ->where('course_id', $course->id)
                ->where('status', 'active')
                ->count(),
            'progress' => $course->materials_count > 0
                ? (int) round(($course->approved_materials_count / $course->materials_count) * 100)
                : 0,
            'weeklySchedule' => TutorCourseResolver::currentWeekScheduleLabel($user, $course->id),
            'nextSession' => Schedule::query()
                ->where('course_id', $course->id)
                ->where('mentor_id', $user->id)
                ->visibleToTutor()
                ->where('start_time', '>=', now())
                ->orderBy('start_time')
                ->value('start_time'),
        ];
    }

    private function materialType(?string $type): string
    {
        return $type === 'bank_soal' ? 'quiz' : ($type ?? 'module');
    }

    private function resolveSelectedCourse($courses, ?string $courseSlug, mixed $legacyCourseId): ?Course
    {
        if ($courseSlug) {
            return $courses->first(fn (Course $course) => $course->slug === $courseSlug || (is_numeric($courseSlug) && (int) $courseSlug === (int) $course->id));
        }

        if ($legacyCourseId) {
            return $courses->firstWhere('id', (int) $legacyCourseId);
        }

        return null;
    }

    private function resolveStudentSlug(string $studentSlug, $courseIds): ?User
    {
        $students = User::query()
            ->whereIn('id', Enrollment::query()
                ->select('user_id')
                ->whereIn('course_id', $courseIds)
                ->where('status', 'active'))
            ->get(['id', 'name', 'email', 'created_at']);

        if (is_numeric($studentSlug)) {
            return $students->firstWhere('id', (int) $studentSlug);
        }

        return $students->first(fn (User $student) => Str::slug($student->name) === $studentSlug);
    }
}
