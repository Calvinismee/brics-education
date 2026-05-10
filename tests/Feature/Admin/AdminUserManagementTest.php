<?php

test('TC_ADMIN_USER_001 admin berhasil menambah user', function () {
    // Dokumentasi: admin POST data user tutor baru; expected user tersimpan dan muncul di database.
    $admin = adminUser();

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Fajar',
        'role' => 'tutor',
        'email' => 'fajar@gmail.com',
        'password' => 'password123',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users', absolute: false));

    $this->assertDatabaseHas('users', [
        'name' => 'Fajar',
        'email' => 'fajar@gmail.com',
        'role_id' => roleIdForTest('tutor'),
    ]);
});

test('TC_ADMIN_USER_002 admin gagal menambah user dengan email duplikat', function () {
    // Dokumentasi: admin POST email yang sudah ada; expected validasi email duplikat.
    $admin = adminUser();
    studentUser(['email' => 'siswa@gmail.com']);

    $response = $this->actingAs($admin)->from(route('admin.users'))->post(route('admin.users.store'), [
        'name' => 'Siswa Duplikat',
        'role' => 'student',
        'email' => 'siswa@gmail.com',
        'password' => 'password123',
    ]);

    $response
        ->assertRedirect(route('admin.users', absolute: false))
        ->assertSessionHasErrors('email');
});

test('TC_ADMIN_USER_003 admin berhasil mengubah role user', function () {
    // Dokumentasi: admin mengubah user dari student menjadi tutor; expected role_id berubah.
    $admin = adminUser();
    $user = studentUser([
        'name' => 'Siswa Role',
        'email' => 'role-user@example.com',
    ]);

    $response = $this->actingAs($admin)->put(route('admin.users.update', $user), [
        'name' => 'Siswa Role',
        'email' => 'role-user@example.com',
        'password' => '',
        'role' => 'tutor',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users', absolute: false));

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'role_id' => roleIdForTest('tutor'),
    ]);
});

test('TC_ADMIN_USER_004 admin berhasil menghapus user', function () {
    // Dokumentasi: admin DELETE user valid; expected user tidak ada lagi di database.
    $admin = adminUser();
    $user = studentUser(['email' => 'hapus-user@example.com']);

    $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $user));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users', absolute: false));

    $this->assertDatabaseMissing('users', [
        'id' => $user->id,
    ]);
});
