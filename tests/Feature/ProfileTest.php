<?php

use App\Models\User;

test('TC_SISWA_PROFIL_001 siswa berhasil mengubah profil', function () {
    $student = studentUser([
        'name' => 'Siswa Awal',
    ]);

    $response = $this
        ->actingAs($student)
        ->from('/dashboard')
        ->patch('/profile', [
            'name' => 'Teera',
            'phone' => '08123456789',
            'gender' => 'female',
            'school_origin' => 'SMA Brics',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/dashboard');

    $student->refresh();

    expect($student->name)->toBe('Teera');
    expect($student->phone)->toBe('08123456789');
    expect($student->gender)->toBe('female');
    expect($student->school_origin)->toBe('SMA Brics');
});

test('TC_SISWA_PROFIL_002 update profil siswa gagal jika nama kosong', function () {
    $student = studentUser([
        'name' => 'Nama Siswa Awal',
    ]);

    $response = $this
        ->actingAs($student)
        ->from('/profile')
        ->patch('/profile', [
            'name' => '',
            'phone' => '08123456789',
        ]);

    $response
        ->assertRedirect('/profile')
        ->assertSessionHasErrors('name');

    expect($student->refresh()->name)->toBe('Nama Siswa Awal');
});
