<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $courses = DB::table('courses')
            ->select('id', 'title', 'description', 'status')
            ->orderBy('title')
            ->get()
            ->map(function ($course) {
                $students = DB::table('enrollments')
                    ->join('users', 'enrollments.user_id', '=', 'users.id')
                    ->leftJoin('packages', 'enrollments.package_id', '=', 'packages.id')
                    ->where('enrollments.course_id', $course->id)
                    ->orderBy('users.name')
                    ->get([
                        'users.id',
                        'users.name',
                        'users.email',
                        'enrollments.status',
                        'enrollments.enrolled_at',
                        'packages.name as package_name',
                    ])
                    ->map(fn ($student) => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'status' => $student->status,
                        'package' => $student->package_name,
                        'enrolledAt' => $student->enrolled_at
                            ? CarbonImmutable::parse($student->enrolled_at)->format('d M Y')
                            : '-',
                    ]);

                $mentorQuery = DB::table('users')
                    ->select('users.id', 'users.name', 'users.email')
                    ->when(Schema::hasTable('course_tutor'), function ($query) {
                        $query->leftJoin('course_tutor', 'users.id', '=', 'course_tutor.tutor_id');
                    })
                    ->where(function ($query) use ($course) {
                        $query->where('users.mentor_course_id', $course->id);

                        if (Schema::hasTable('course_tutor')) {
                            $query->orWhere('course_tutor.course_id', $course->id);
                        }
                    })
                    ->distinct()
                    ->orderBy('users.name');

                $mentors = $mentorQuery->get()->map(fn ($mentor) => [
                    'id' => $mentor->id,
                    'name' => $mentor->name,
                    'email' => $mentor->email,
                ]);

                $contents = DB::table('materials')
                    ->leftJoin('users', 'materials.uploaded_by', '=', 'users.id')
                    ->where('materials.course_id', $course->id)
                    ->orderByRaw("case when materials.approval_status = 'pending' then 0 else 1 end")
                    ->orderByDesc('materials.created_at')
                    ->get([
                        'materials.id',
                        'materials.title',
                        'materials.type',
                        'materials.approval_status',
                        'materials.created_at',
                        'users.name as tutor_name',
                    ])
                    ->map(fn ($content) => [
                        'id' => $content->id,
                        'title' => $content->title,
                        'type' => $content->type,
                        'status' => $content->approval_status,
                        'tutor' => $content->tutor_name ?: 'Tutor',
                        'submitted' => $content->created_at
                            ? CarbonImmutable::parse($content->created_at)->format('d M Y')
                            : '-',
                    ]);

                $packages = DB::table('package_course')
                    ->join('packages', 'package_course.package_id', '=', 'packages.id')
                    ->where('package_course.course_id', $course->id)
                    ->orderBy('packages.name')
                    ->get(['packages.id', 'packages.name'])
                    ->map(fn ($package) => [
                        'id' => $package->id,
                        'name' => $package->name,
                    ]);

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'status' => $course->status,
                    'packages' => $packages,
                    'students' => $students,
                    'mentors' => $mentors,
                    'contents' => $contents,
                    'counts' => [
                        'students' => $students->count(),
                        'mentors' => $mentors->count(),
                        'contents' => $contents->count(),
                        'pendingContents' => $contents->where('status', 'pending')->count(),
                    ],
                ];
            });

        return Inertia::render('Admin/Courses', [
            'courses' => $courses,
            'stats' => [
                'totalCourses' => $courses->count(),
                'totalEnrollments' => DB::table('enrollments')->count(),
                'totalMentors' => $this->totalAssignedMentors(),
                'totalContents' => DB::table('materials')->count(),
            ],
        ]);
    }

    private function totalAssignedMentors(): int
    {
        $query = DB::table('users');

        if (Schema::hasTable('course_tutor')) {
            return $query
                ->leftJoin('course_tutor', 'users.id', '=', 'course_tutor.tutor_id')
                ->where(function ($subQuery) {
                    $subQuery->whereNotNull('users.mentor_course_id')
                        ->orWhereNotNull('course_tutor.course_id');
                })
                ->distinct('users.id')
                ->count('users.id');
        }

        return $query->whereNotNull('mentor_course_id')->count();
    }
}
