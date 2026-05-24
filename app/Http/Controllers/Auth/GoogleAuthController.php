<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AdminNotifier;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class GoogleAuthController extends Controller
{
    private const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

    private const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

    public function redirect(Request $request): RedirectResponse
    {
        if (! $this->hasGoogleConfig()) {
            return $this->redirectWithError('Login Google belum dikonfigurasi.');
        }

        $state = Str::random(40);

        $request->session()->put('google_oauth_state', $state);

        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => $this->redirectUri(),
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'state' => $state,
            'access_type' => 'online',
            'prompt' => 'select_account',
        ], '', '&', PHP_QUERY_RFC3986);

        return redirect()->away(self::AUTH_URL.'?'.$query);
    }

    public function callback(Request $request): RedirectResponse
    {
        if (! $this->hasGoogleConfig()) {
            return $this->redirectWithError('Login Google belum dikonfigurasi.');
        }

        if ($request->filled('error')) {
            return $this->redirectWithError('Login Google dibatalkan atau tidak diizinkan.');
        }

        if (! $this->stateIsValid($request)) {
            return $this->redirectWithError('Sesi login Google tidak valid. Silakan coba lagi.');
        }

        if (! $request->filled('code')) {
            return $this->redirectWithError('Kode otorisasi Google tidak ditemukan.');
        }

        try {
            $googleUser = $this->fetchGoogleUser((string) $request->string('code'));
        } catch (Throwable) {
            return $this->redirectWithError('Gagal terhubung ke Google. Silakan coba lagi.');
        }

        return $this->authenticateGoogleUser($request, $googleUser);
    }

    public function credential(Request $request): RedirectResponse
    {
        if (! $this->hasGoogleClientId()) {
            return $this->redirectWithError('Login Google belum dikonfigurasi.');
        }

        $validated = $request->validate([
            'credential' => ['required', 'string'],
        ]);

        try {
            $googleUser = $this->fetchGoogleUserFromCredential($validated['credential']);
        } catch (Throwable) {
            return $this->redirectWithError('Gagal memverifikasi akun Google. Silakan coba lagi.');
        }

        return $this->authenticateGoogleUser($request, $googleUser);
    }

    private function fetchGoogleUser(string $code): array
    {
        $tokenResponse = Http::asForm()->post(self::TOKEN_URL, [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => $this->redirectUri(),
            'grant_type' => 'authorization_code',
            'code' => $code,
        ]);

        if ($tokenResponse->failed()) {
            throw new \RuntimeException('Google token request failed.');
        }

        $accessToken = $tokenResponse->json('access_token');

        if (! is_string($accessToken) || $accessToken === '') {
            throw new \RuntimeException('Google access token missing.');
        }

        $userResponse = Http::withToken($accessToken)->get(self::USERINFO_URL);

        if ($userResponse->failed()) {
            throw new \RuntimeException('Google userinfo request failed.');
        }

        $payload = $userResponse->json();

        if (! is_array($payload)) {
            throw new \RuntimeException('Google userinfo response is invalid.');
        }

        return $payload;
    }

    private function fetchGoogleUserFromCredential(string $credential): array
    {
        $response = Http::get(self::TOKENINFO_URL, [
            'id_token' => $credential,
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Google credential verification failed.');
        }

        $payload = $response->json();

        if (! is_array($payload)) {
            throw new \RuntimeException('Google credential response is invalid.');
        }

        if (($payload['aud'] ?? null) !== config('services.google.client_id')) {
            throw new \RuntimeException('Google credential audience mismatch.');
        }

        return [
            'sub' => $payload['sub'] ?? null,
            'name' => $payload['name'] ?? null,
            'email' => $payload['email'] ?? null,
            'email_verified' => filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'picture' => $payload['picture'] ?? null,
        ];
    }

    private function authenticateGoogleUser(Request $request, array $googleUser): RedirectResponse
    {
        if (empty($googleUser['sub']) || empty($googleUser['email'])) {
            return $this->redirectWithError('Data akun Google tidak lengkap.');
        }

        if (filter_var($googleUser['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN) !== true) {
            return $this->redirectWithError('Email Google belum terverifikasi.');
        }

        $user = $this->findOrCreateStudent($googleUser);

        if (! $user) {
            return $this->redirectWithError('Akun ini tidak memiliki akses siswa.');
        }

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function findOrCreateStudent(array $googleUser): ?User
    {
        return DB::transaction(function () use ($googleUser) {
            $userByGoogleId = User::query()
                ->where('google_id', $googleUser['sub'])
                ->lockForUpdate()
                ->first();

            $userByEmail = User::query()
                ->where('email', $googleUser['email'])
                ->lockForUpdate()
                ->first();

            if ($userByGoogleId && $userByEmail && ! $userByGoogleId->is($userByEmail)) {
                return null;
            }

            $user = $userByGoogleId ?? $userByEmail;

            if ($user) {
                if (! $this->isStudent($user)) {
                    return null;
                }

                $user->forceFill([
                    'google_id' => $googleUser['sub'],
                    'google_avatar' => $googleUser['picture'] ?? $user->google_avatar,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ])->save();

                return $user;
            }

            $user = User::create([
                'name' => $googleUser['name'] ?? Str::before($googleUser['email'], '@'),
                'email' => $googleUser['email'],
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(32)),
                'role_id' => User::roleIdFor('student') ?? 1,
                'google_id' => $googleUser['sub'],
                'google_avatar' => $googleUser['picture'] ?? null,
            ]);

            event(new Registered($user));
            AdminNotifier::studentRegistered($user);

            return $user;
        });
    }

    private function isStudent(User $user): bool
    {
        return strtolower((string) User::roleNameFor($user->role_id)) === 'student';
    }

    private function hasGoogleConfig(): bool
    {
        return $this->hasGoogleClientId()
            && filled(config('services.google.client_secret'))
            && filled($this->redirectUri());
    }

    private function hasGoogleClientId(): bool
    {
        return filled(config('services.google.client_id'));
    }

    private function redirectUri(): ?string
    {
        return config('services.google.redirect');
    }

    private function stateIsValid(Request $request): bool
    {
        $state = $request->session()->pull('google_oauth_state');
        $requestState = $request->input('state');

        return is_string($state)
            && is_string($requestState)
            && hash_equals($state, $requestState);
    }

    private function redirectWithError(string $message): RedirectResponse
    {
        return redirect()->route('login')->withErrors([
            'google' => $message,
        ]);
    }
}
