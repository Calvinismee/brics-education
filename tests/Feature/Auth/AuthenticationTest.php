<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;

test('TC_SISWA_LOGIN_001 siswa berhasil login dengan data valid', function () {
    $student = studentUser([
        'email' => 'siswa@example.test',
        'password' => hashedPasswordForTest('password123'),
    ]);

    $response = $this->post('/login', [
        'email' => 'siswa@example.test',
        'password' => 'password123',
    ]);

    $this->assertAuthenticatedAs($student);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('TC_SISWA_LOGIN_002 siswa gagal login dengan password salah', function () {
    studentUser([
        'email' => 'siswa-salah@example.test',
        'password' => hashedPasswordForTest('password123'),
    ]);

    $response = $this->from(route('login'))->post('/login', [
        'email' => 'siswa-salah@example.test',
        'password' => 'salah123',
    ]);

    $this->assertGuest();
    $response
        ->assertRedirect(route('login', absolute: false))
        ->assertSessionHasErrors('email');
});

test('TC_SISWA_LOGIN_003 siswa gagal login jika field kosong', function () {
    $response = $this->from(route('login'))->post('/login', [
        'email' => '',
        'password' => '',
    ]);

    $this->assertGuest();
    $response
        ->assertRedirect(route('login', absolute: false))
        ->assertSessionHasErrors(['email', 'password']);
});

test('TC_TUTOR_LOGIN_001 tutor berhasil login dengan data valid', function () {
    [, $tutor] = tutorCourseScenario();

    $response = $this->post(route('login.tutor.store'), [
        'email' => $tutor->email,
        'password' => 'password123',
    ]);

    $this->assertAuthenticatedAs($tutor);
    $response->assertRedirect(route('tutor.dashboard', absolute: false));
});

test('TC_TUTOR_LOGIN_002 tutor gagal login dengan password salah', function () {
    [, $tutor] = tutorCourseScenario();

    $response = $this->from(route('login.tutor'))->post(route('login.tutor.store'), [
        'email' => $tutor->email,
        'password' => 'salah123',
    ]);

    $this->assertGuest();
    $response
        ->assertRedirect(route('login.tutor', absolute: false))
        ->assertSessionHasErrors('email');
});

test('TC_TUTOR_LOGIN_003 tutor gagal login jika field kosong', function () {
    $response = $this->from(route('login.tutor'))->post(route('login.tutor.store'), [
        'email' => '',
        'password' => '',
    ]);

    $this->assertGuest();
    $response
        ->assertRedirect(route('login.tutor', absolute: false))
        ->assertSessionHasErrors(['email', 'password']);
});

test('TC_SISWA_LOGOUT_001 siswa berhasil logout', function () {
    $student = studentUser();

    $response = $this->actingAs($student)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('TC_TUTOR_LOGOUT_001 tutor berhasil logout', function () {
    [, $tutor] = tutorCourseScenario();

    $response = $this->actingAs($tutor)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('login.tutor', absolute: false));
});

function configureGoogleAuthForTest(): void
{
    config([
        'services.google.client_id' => 'google-client-id',
        'services.google.client_secret' => 'google-client-secret',
        'services.google.redirect' => 'http://localhost/auth/google/callback',
    ]);
}
