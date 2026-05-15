<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        $request->session()->forget('url.intended');

        $user = auth()->user();

        // Redirect admin users to admin dashboard
        if ($user && $user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $role = strtolower((string) User::roleNameFor($user?->role_id));

        if (in_array($role, ['tutor', 'mentor'], true)) {
            return redirect()->route('tutor.dashboard');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        $request->session()->forget('url.intended');

        if (! auth()->user()?->isAdmin()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login.admin')->withErrors([
                'email' => 'Akun ini tidak memiliki akses admin.',
            ]);
        }

        return redirect()->route('admin.dashboard');
    }

    /**
     * Handle an incoming tutor authentication request.
     */
    public function storeTutor(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        $request->session()->forget('url.intended');

        $role = strtolower((string) User::roleNameFor(auth()->user()?->role_id));

        if (! in_array($role, ['tutor', 'mentor'], true)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login.tutor')->withErrors([
                'email' => 'Akun ini tidak memiliki akses tutor.',
            ]);
        }

        return redirect()->route('tutor.dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        if ($user?->isAdmin()) {
            return redirect()->route('login.admin');
        }

        $role = strtolower((string) User::roleNameFor($user?->role_id));

        if (in_array($role, ['tutor', 'mentor'], true)) {
            return redirect()->route('login.tutor');
        }

        return redirect('/');
    }
}
