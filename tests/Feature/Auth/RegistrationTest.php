<?php

test('TC_SISWA_REG_001 siswa berhasil registrasi dengan data valid', function () {
    $response = $this->post('/register', [
        'name' => 'Teera',
        'email' => 'teera@example.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $this->assertDatabaseHas('users', [
        'name' => 'Teera',
        'email' => 'teera@example.test',
        'role_id' => roleIdForTest('student'),
    ]);
});

test('TC_SISWA_REG_002 registrasi gagal jika email sudah terdaftar', function () {
    studentUser([
        'email' => 'siswa@example.test',
    ]);

    $response = $this->from(route('register'))->post('/register', [
        'name' => 'Siswa Baru',
        'email' => 'siswa@example.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertGuest();
    $response
        ->assertRedirect(route('register', absolute: false))
        ->assertSessionHasErrors('email');
});

test('TC_SISWA_REG_003 registrasi gagal jika konfirmasi password berbeda', function () {
    $response = $this->from(route('register'))->post('/register', [
        'name' => 'Teera',
        'email' => 'teera-konfirmasi@example.test',
        'password' => 'password123',
        'password_confirmation' => 'password456',
    ]);

    $this->assertGuest();
    $response
        ->assertRedirect(route('register', absolute: false))
        ->assertSessionHasErrors('password');

    $this->assertDatabaseMissing('users', [
        'email' => 'teera-konfirmasi@example.test',
    ]);
});
