<?php

use Illuminate\Support\Facades\DB;

test('tutor upload sends one admin notification for pending review', function () {
    $admin = adminUser();
    $course = courseRecord(['title' => 'Pemahaman Bacaan dan Menulis']);
    $tutor = tutorUser([
        'name' => 'Tutor Dev',
        'mentor_course_id' => $course['id'],
    ]);

    $response = $this->actingAs($tutor)->post(route('tutor.materials.store'), [
        'course_id' => $course['id'],
        'title' => 'Test',
        'youtube_url' => 'https://youtu.be/abc123XYZ89',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('tutor.upload', absolute: false));

    expect(DB::table('notifications')->where('user_id', $admin->id)->count())->toBe(1);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'title' => 'Konten Menunggu Persetujuan',
        'message' => 'Tutor Dev mengunggah Test untuk Pemahaman Bacaan dan Menulis dan menunggu review admin.',
    ]);
});
