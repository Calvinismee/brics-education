<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'gender' => 'male',
            'phone' => '081234567890',
            'school_origin' => 'SMA Negeri 1 Jakarta',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $user->refresh();

    $this->assertSame('Test User', $user->name);
    $this->assertSame('test@example.com', $user->email);
    $this->assertSame('male', $user->gender);
    $this->assertSame('081234567890', $user->phone);
    $this->assertSame('SMA Negeri 1 Jakarta', $user->school_origin);
    $this->assertNull($user->email_verified_at);
});

test('student profile fields can be updated without changing email', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Siswa Lengkap',
            'gender' => 'female',
            'phone' => '+62 812-3456-7890',
            'school_origin' => 'MAN 2 Bandung',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $user->refresh();

    $this->assertSame('Siswa Lengkap', $user->name);
    $this->assertSame('female', $user->gender);
    $this->assertSame('+62 812-3456-7890', $user->phone);
    $this->assertSame('MAN 2 Bandung', $user->school_origin);
    $this->assertNotNull($user->email_verified_at);
});

test('student profile update returns to the current dashboard page', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/dashboard')
        ->patch('/profile', [
            'name' => 'Siswa Dashboard',
            'gender' => 'male',
            'phone' => '081122334455',
            'school_origin' => 'SMAN 5 Surabaya',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/dashboard');

    $this->assertSame('Siswa Dashboard', $user->refresh()->name);
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertNotNull($user->refresh()->email_verified_at);
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete('/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    $this->assertNull($user->fresh());
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->delete('/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/profile');

    $this->assertNotNull($user->fresh());
});
