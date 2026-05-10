<?php

test('TC_ADMIN_LOGIN_001 admin berhasil login dengan data valid', function () {
    // Dokumentasi: POST kredensial admin valid ke login admin; expected redirect ke dashboard admin.
    $admin = adminUser([
        'email' => 'admin@brics.com',
        'password' => hashedPasswordForTest('password123'),
    ]);

    $response = $this->post(route('login.admin.store'), [
        'email' => 'admin@brics.com',
        'password' => 'password123',
    ]);

    $this->assertAuthenticatedAs($admin);
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('TC_ADMIN_LOGIN_002 admin gagal login dengan password salah', function () {
    // Dokumentasi: POST email admin valid dengan password salah; expected tetap guest dan error email.
    adminUser([
        'email' => 'admin@brics.com',
        'password' => hashedPasswordForTest('password123'),
    ]);

    $response = $this->from(route('login.admin'))->post(route('login.admin.store'), [
        'email' => 'admin@brics.com',
        'password' => 'salah123',
    ]);

    $this->assertGuest();
    $response
        ->assertRedirect(route('login.admin', absolute: false))
        ->assertSessionHasErrors('email');
});

test('TC_ADMIN_LOGIN_003 admin gagal login jika field kosong', function () {
    // Dokumentasi: POST login admin tanpa email/password; expected validasi email dan password wajib diisi.
    $response = $this->from(route('login.admin'))->post(route('login.admin.store'), [
        'email' => '',
        'password' => '',
    ]);

    $this->assertGuest();
    $response
        ->assertRedirect(route('login.admin', absolute: false))
        ->assertSessionHasErrors(['email', 'password']);
});

test('TC_ADMIN_LOGOUT_001 admin berhasil logout', function () {
    // Dokumentasi: admin aktif POST logout; expected sesi berakhir dan diarahkan ke halaman login admin.
    $admin = adminUser();

    $response = $this->actingAs($admin)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('login.admin', absolute: false));
});
