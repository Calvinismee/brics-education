<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(Request $request): Response
    {
        $role = $this->requestedRole($request);

        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'role' => $role,
            'loginUrl' => $this->loginUrl($role),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'role' => ['nullable', Rule::in(['student', 'tutor', 'admin'])],
        ]);

        $role = $this->requestedRole($request);
        $user = User::query()->where('email', (string) $request->string('email'))->first();

        if ($user && $this->roleFor($user) !== $role) {
            throw ValidationException::withMessages([
                'email' => ['Email tidak terdaftar sebagai akun '.$this->roleLabel($role).'.'],
            ]);
        }

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', 'Tautan reset password telah dikirim. Silakan periksa email Anda.');
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    private function requestedRole(Request $request): string
    {
        $role = strtolower(trim((string) $request->input('role', 'student')));

        return in_array($role, ['student', 'tutor', 'admin'], true) ? $role : 'student';
    }

    private function roleFor(User $user): string
    {
        if ($user->isAdmin()) {
            return 'admin';
        }

        return in_array(strtolower(User::roleNameFor($user->role_id)), ['tutor', 'mentor'], true)
            ? 'tutor'
            : 'student';
    }

    private function roleLabel(string $role): string
    {
        return match ($role) {
            'admin' => 'admin',
            'tutor' => 'tutor',
            default => 'siswa',
        };
    }

    private function loginUrl(string $role): string
    {
        return match ($role) {
            'admin' => route('login.admin'),
            'tutor' => route('login.tutor'),
            default => route('login'),
        };
    }
}
