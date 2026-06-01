<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;

test('halaman lupa password membawa konteks role dan login yang sesuai', function (string $role, string $loginRoute) {
    $this->get(route('password.request', ['role' => $role]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Auth/ForgotPassword')
            ->where('role', $role)
            ->where('loginUrl', route($loginRoute)));
})->with([
    'siswa' => ['student', 'login'],
    'tutor' => ['tutor', 'login.tutor'],
    'admin' => ['admin', 'login.admin'],
]);

test('siswa tutor dan admin dapat meminta tautan reset password', function (string $role) {
    Notification::fake();
    $user = passwordResetUser($role);

    $this->post(route('password.email'), [
        'email' => $user->email,
        'role' => $role,
    ])->assertSessionHas('status');

    Notification::assertSentTo($user, ResetPassword::class);
})->with(['student', 'tutor', 'admin']);

test('permintaan reset ditolak jika role halaman tidak sesuai dengan akun', function () {
    Notification::fake();
    $tutor = passwordResetUser('tutor');

    $this->post(route('password.email'), [
        'email' => $tutor->email,
        'role' => 'student',
    ])->assertSessionHasErrors('email');

    Notification::assertNothingSent();
});

test('siswa tutor dan admin dapat reset password lalu login memakai credential baru', function (
    string $role,
    string $loginRoute,
    string $dashboardRoute
) {
    $user = passwordResetUser($role);
    $token = Password::createToken($user);

    $this->post(route('password.store'), [
        'token' => $token,
        'email' => $user->email,
        'password' => 'password-baru-123',
        'password_confirmation' => 'password-baru-123',
    ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route($loginRoute, absolute: false));

    expect(Hash::check('password-baru-123', $user->fresh()->password))->toBeTrue();

    $this->post(route($loginRoute === 'login' ? 'login' : $loginRoute.'.store'), [
        'email' => $user->email,
        'password' => 'password-baru-123',
    ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route($dashboardRoute, absolute: false));

    $this->assertAuthenticatedAs($user);
})->with([
    'siswa' => ['student', 'login', 'dashboard'],
    'tutor' => ['tutor', 'login.tutor', 'tutor.dashboard'],
    'admin' => ['admin', 'login.admin', 'admin.dashboard'],
]);

function passwordResetUser(string $role): User
{
    return userWithRoleForTest($role, [
        'email' => $role.'.reset@example.test',
        'password' => Hash::make('password-lama-123'),
    ]);
}
