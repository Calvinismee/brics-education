<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    config(['filesystems.materials_disk' => 'public']);
});

test('TC_TUTOR_UPLOAD_001 tutor dapat upload materi PDF dan video pembelajaran', function () {
    Storage::fake('public');

    [$course, $tutor] = tutorCourseScenario();

    $response = $this->actingAs($tutor)->post(route('tutor.materials.store'), [
        'course_id' => $course['id'],
        'title' => 'Materi TPS Tutor',
        'description' => 'Materi latihan dari tutor.',
        'youtube_url' => 'https://www.youtube.com/watch?v=abc123XYZ89',
        'module_file' => UploadedFile::fake()->create('materi-tutor.pdf', 64, 'application/pdf'),
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('tutor.upload', absolute: false));

    $this->assertDatabaseHas('materials', [
        'course_id' => $course['id'],
        'uploaded_by' => $tutor->id,
        'title' => 'Materi TPS Tutor',
        'type' => 'video',
        'content' => 'https://www.youtube.com/watch?v=abc123XYZ89',
        'approval_status' => 'pending',
    ]);

    $module = DB::table('materials')->where('title', 'Materi TPS Tutor - Modul')->first();

    expect($module)->not->toBeNull();
    expect($module->type)->toBe('module');
    expect($module->storage_disk)->toBe('public');
    Storage::disk('public')->assertExists($module->file_path);
});

test('TC_TUTOR_UPLOAD_002 tutor gagal embed video jika link tidak valid', function () {
    [$course, $tutor] = tutorCourseScenario();

    $response = $this->actingAs($tutor)->from(route('tutor.upload'))->post(route('tutor.materials.store'), [
        'course_id' => $course['id'],
        'title' => 'Video Invalid Tutor',
        'youtube_url' => 'link-youtube-tidak-valid',
    ]);

    $response
        ->assertRedirect(route('tutor.upload', absolute: false))
        ->assertSessionHasErrors('youtube_url');

    $this->assertDatabaseMissing('materials', [
        'title' => 'Video Invalid Tutor',
    ]);
});
