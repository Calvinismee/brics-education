<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('admin users can authenticate using the admin login screen', function () {
    $user = adminUser();

    $response = $this->post('/login/admin', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('google auth redirects students to google consent screen', function () {
    configureGoogleAuthForTest();

    $response = $this->get(route('auth.google.redirect'));

    $response->assertRedirect();
    $response->assertSessionHas('google_oauth_state');

    $location = $response->headers->get('Location');
    parse_str(parse_url($location, PHP_URL_QUERY), $query);

    expect($location)->toStartWith('https://accounts.google.com/o/oauth2/v2/auth');
    expect($query['client_id'])->toBe('google-client-id');
    expect($query['redirect_uri'])->toBe('http://localhost/auth/google/callback');
    expect($query['response_type'])->toBe('code');
    expect($query['state'])->toBe(session('google_oauth_state'));
});

test('students can authenticate with google', function () {
    seedRolesForTests();
    configureGoogleAuthForTest();

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'google-access-token',
        ]),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-user-123',
            'name' => 'Siswa Google',
            'email' => 'siswa.google@example.test',
            'email_verified' => true,
            'picture' => 'https://example.test/avatar.jpg',
        ]),
    ]);

    $response = $this
        ->withSession(['google_oauth_state' => 'valid-state'])
        ->get(route('auth.google.callback', [
            'state' => 'valid-state',
            'code' => 'valid-code',
        ]));

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $this->assertDatabaseHas('users', [
        'name' => 'Siswa Google',
        'email' => 'siswa.google@example.test',
        'google_id' => 'google-user-123',
        'role_id' => roleIdForTest('student'),
    ]);
});

test('students can authenticate with google credential popup', function () {
    seedRolesForTests();
    configureGoogleAuthForTest();

    Http::fake([
        'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
            'aud' => 'google-client-id',
            'sub' => 'google-popup-123',
            'name' => 'Siswa Popup',
            'email' => 'siswa.popup@example.test',
            'email_verified' => 'true',
            'picture' => 'https://example.test/popup-avatar.jpg',
        ]),
    ]);

    $response = $this->post(route('auth.google.credential'), [
        'credential' => 'google-id-token',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $this->assertDatabaseHas('users', [
        'name' => 'Siswa Popup',
        'email' => 'siswa.popup@example.test',
        'google_id' => 'google-popup-123',
        'role_id' => roleIdForTest('student'),
    ]);
});

test('google credential popup rejects tokens for another client id', function () {
    configureGoogleAuthForTest();

    Http::fake([
        'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
            'aud' => 'another-client-id',
            'sub' => 'google-popup-123',
            'name' => 'Siswa Popup',
            'email' => 'siswa.popup@example.test',
            'email_verified' => 'true',
        ]),
    ]);

    $response = $this->post(route('auth.google.credential'), [
        'credential' => 'google-id-token',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('login', absolute: false));
    $response->assertSessionHasErrors('google');
});

test('google auth cannot authenticate non student accounts from student login', function () {
    configureGoogleAuthForTest();

    $admin = adminUser([
        'email' => 'admin.google@example.test',
    ]);

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'google-access-token',
        ]),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-admin-123',
            'name' => 'Admin Google',
            'email' => 'admin.google@example.test',
            'email_verified' => true,
        ]),
    ]);

    $response = $this
        ->withSession(['google_oauth_state' => 'valid-state'])
        ->get(route('auth.google.callback', [
            'state' => 'valid-state',
            'code' => 'valid-code',
        ]));

    $this->assertGuest();
    $response->assertRedirect(route('login', absolute: false));
    $response->assertSessionHasErrors('google');

    expect($admin->fresh()->google_id)->toBeNull();
});

function configureGoogleAuthForTest(): void
{
    config([
        'services.google.client_id' => 'google-client-id',
        'services.google.client_secret' => 'google-client-secret',
        'services.google.redirect' => 'http://localhost/auth/google/callback',
    ]);
}
