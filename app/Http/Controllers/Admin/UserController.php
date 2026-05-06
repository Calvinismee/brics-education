<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->select('id', 'name', 'email', 'role', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'totalUsers' => User::count(),
            'stats' => [
                'student' => User::where('role', 'student')->count(),
                'tutor' => User::where('role', 'tutor')->count(),
                'admin' => User::where('role', 'admin')->count(),
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
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
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
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('admin.users')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function export(Request $request): StreamedResponse
    {
        $role = $request->string('role')->toString();
        $search = $request->string('search')->toString();

        $users = User::query()
            ->when(in_array($role, ['student', 'tutor', 'admin'], true), fn ($query) => $query->where('role', $role))
            ->when($search !== '', fn ($query) => $query->where(function ($subQuery) use ($search) {
                $subQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderBy('created_at', 'desc')
            ->get(['name', 'email', 'role', 'created_at']);

        $fileName = 'users-' . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($users) {
            $output = fopen('php://output', 'w');

            fputcsv($output, ['Nama', 'Email', 'Peran', 'Bergabung']);

            foreach ($users as $user) {
                fputcsv($output, [
                    $user->name,
                    $user->email,
                    ucfirst($user->role),
                    optional($user->created_at)->format('d M Y'),
                ]);
            }

            fclose($output);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
