<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    public function index()
    {
        $roles = User::adminRoleIds();

        $users = User::query()
            ->select('id', 'name', 'email', 'role_id', 'mentor_course_id', 'created_at')
            ->with('role:id,name')
            ->with('mentorCourse:id,title')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $users->getCollection()->transform(function (User $user) {
            $role = strtolower((string) User::roleNameFor($user->role_id));

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'mentor_course_id' => $user->mentor_course_id,
                'taughtCourse' => in_array($role, ['mentor', 'tutor'], true) ? $user->mentorCourse?->title : null,
                'enrolledCourses' => $role === 'student'
                    ? DB::table('enrollments')
                        ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                        ->leftJoin('packages', 'enrollments.package_id', '=', 'packages.id')
                        ->where('enrollments.user_id', $user->id)
                        ->orderBy('courses.title')
                        ->get(['courses.id', 'courses.title', 'enrollments.status', 'packages.name as package_name'])
                        ->map(fn ($course) => [
                            'id' => $course->id,
                            'title' => $course->title,
                            'status' => $course->status,
                            'package' => $course->package_name,
                        ])
                        ->all()
                    : [],
            ];
        });

        $roleStats = User::query()
            ->selectRaw('role_id, count(*) as total')
            ->groupBy('role_id')
            ->pluck('total', 'role_id');

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'courses' => DB::table('courses')->select('id', 'title')->orderBy('title')->get(),
            'totalUsers' => $roleStats->sum(),
            'stats' => [
                'student' => $roleStats->get($roles['student'], 0),
                'tutor' => $roleStats->get($roles['tutor'], 0),
                'admin' => $roleStats->get($roles['admin'], 0),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['student', 'tutor', 'admin'])],
            'mentor_course_id' => ['nullable', 'integer', 'exists:courses,id'],
        ]);

        $roles = User::adminRoleIds();

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $roles[$validated['role']] ?? 1,
            'mentor_course_id' => $validated['role'] === 'tutor' ? ($validated['mentor_course_id'] ?? null) : null,
        ]);

        return redirect()->route('admin.users')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in(['student', 'tutor', 'admin'])],
            'mentor_course_id' => ['nullable', 'integer', 'exists:courses,id'],
        ]);

        $roles = User::adminRoleIds();

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role_id = $roles[$validated['role']] ?? $user->role_id;
        $user->mentor_course_id = $validated['role'] === 'tutor' ? ($validated['mentor_course_id'] ?? null) : null;

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('admin.users')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('admin.users')->with('success', 'Pengguna berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        $role = $request->string('role')->toString();
        $search = $request->string('search')->toString();

        $roles = User::adminRoleIds();

        $users = User::query()
            ->when(in_array($role, ['student', 'tutor', 'admin'], true), fn ($query) => $query->where('role_id', $roles[$role] ?? 0))
            ->when($search !== '', fn ($query) => $query->where(function ($subQuery) use ($search) {
                $subQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderBy('created_at', 'desc')
            ->get(['name', 'email', 'role_id', 'created_at']);

        $fileName = 'users-'.now()->format('Y-m-d-His').'.csv';

        DB::table('report_exports')->insert([
            'user_id' => $request->user()?->id,
            'type' => 'Pengguna',
            'title' => 'Export Pengguna',
            'file_name' => $fileName,
            'row_count' => $users->count(),
            'filters' => json_encode(array_filter([
                'role' => $role !== '' ? $role : null,
                'search' => $search !== '' ? $search : null,
            ])),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->streamDownload(function () use ($users) {
            $output = fopen('php://output', 'w');

            fputcsv($output, ['Nama', 'Email', 'Peran', 'Bergabung']);

            foreach ($users as $user) {
                fputcsv($output, [
                    $user->name,
                    $user->email,
                    ucfirst(User::roleNameFor($user->role_id)),
                    optional($user->created_at)->format('d M Y'),
                ]);
            }

            fclose($output);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
