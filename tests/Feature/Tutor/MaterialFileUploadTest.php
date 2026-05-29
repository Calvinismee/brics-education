<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    config(['filesystems.materials_disk' => 'public']);
});

test('tutor dapat upload module_file dengan format valid', function (string $extension, string $mimeType) {
    Storage::fake('public');

    $course = courseRecord(['title' => 'Penalaran Umum']);
    $tutor = tutorUser(['mentor_course_id' => $course['id']]);
    $title = "Materi Valid {$extension}";

    $response = $this->actingAs($tutor)->post(route('tutor.materials.store'), [
        'course_id' => $course['id'],
        'title' => $title,
        'module_file' => UploadedFile::fake()->create("materi-valid.{$extension}", 64, $mimeType),
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('tutor.upload', absolute: false));

    $material = DB::table('materials')->where('title', "{$title} - Modul")->first();

    expect($material)->not->toBeNull();
    expect($material->type)->toBe('module');
    expect($material->approval_status)->toBe('pending');
    expect((int) $material->course_id)->toBe($course['id']);
    expect((int) $material->uploaded_by)->toBe($tutor->id);

    $this->assertStringStartsWith('/storage/materials/modules/', $material->file_url);
    Storage::disk('public')->assertExists(substr($material->file_url, strlen('/storage/')));
})->with([
    'pdf' => ['pdf', 'application/pdf'],
    'doc' => ['doc', 'application/msword'],
    'docx' => ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'ppt' => ['ppt', 'application/vnd.ms-powerpoint'],
    'pptx' => ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
]);

test('tutor dapat upload module_file dan quiz_file sekaligus', function () {
    Storage::fake('public');

    $course = courseRecord(['title' => 'Literasi Bahasa Indonesia']);
    $tutor = tutorUser(['mentor_course_id' => $course['id']]);

    $response = $this->actingAs($tutor)->post(route('tutor.materials.store'), [
        'course_id' => $course['id'],
        'title' => 'Paket Materi Lengkap',
        'description' => 'Modul dan bank soal untuk latihan.',
        'module_file' => UploadedFile::fake()->create('modul.pdf', 128, 'application/pdf'),
        'quiz_file' => UploadedFile::fake()->create('bank-soal.pptx', 128, 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('tutor.upload', absolute: false));

    $module = DB::table('materials')->where('title', 'Paket Materi Lengkap - Modul')->first();
    $quiz = DB::table('materials')->where('title', 'Paket Materi Lengkap - Bank Soal')->first();

    expect(DB::table('materials')->where('uploaded_by', $tutor->id)->count())->toBe(2);

    expect($module)->not->toBeNull();
    expect($module->type)->toBe('module');
    expect($module->content)->toBe('Modul dan bank soal untuk latihan.');
    $this->assertStringStartsWith('/storage/materials/modules/', $module->file_url);
    Storage::disk('public')->assertExists(substr($module->file_url, strlen('/storage/')));

    expect($quiz)->not->toBeNull();
    expect($quiz->type)->toBe('quiz');
    expect($quiz->content)->toBe('Modul dan bank soal untuk latihan.');
    $this->assertStringStartsWith('/storage/materials/quizzes/', $quiz->file_url);
    Storage::disk('public')->assertExists(substr($quiz->file_url, strlen('/storage/')));
});

test('tutor dapat upload file pada batas maksimal 51200 KB', function () {
    Storage::fake('public');

    $course = courseRecord(['title' => 'Pengetahuan Kuantitatif']);
    $tutor = tutorUser(['mentor_course_id' => $course['id']]);

    $response = $this->actingAs($tutor)->post(route('tutor.materials.store'), [
        'course_id' => $course['id'],
        'title' => 'Materi Batas Maksimal',
        'module_file' => UploadedFile::fake()->create('materi-batas.pdf', 51200, 'application/pdf'),
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('tutor.upload', absolute: false));

    $material = DB::table('materials')->where('title', 'Materi Batas Maksimal - Modul')->first();

    expect($material)->not->toBeNull();
    $this->assertStringStartsWith('/storage/materials/modules/', $material->file_url);
    Storage::disk('public')->assertExists(substr($material->file_url, strlen('/storage/')));
});

test('tutor gagal upload file lebih besar dari 51200 KB', function () {
    Storage::fake('public');

    $course = courseRecord(['title' => 'Pengetahuan dan Pemahaman Umum']);
    $tutor = tutorUser(['mentor_course_id' => $course['id']]);

    $response = $this->actingAs($tutor)->from(route('tutor.upload'))->post(route('tutor.materials.store'), [
        'course_id' => $course['id'],
        'title' => 'Materi Terlalu Besar',
        'module_file' => UploadedFile::fake()->create('materi-besar.pdf', 51201, 'application/pdf'),
    ]);

    $response
        ->assertRedirect(route('tutor.upload', absolute: false))
        ->assertSessionHasErrors('module_file');

    $this->assertDatabaseMissing('materials', [
        'title' => 'Materi Terlalu Besar - Modul',
    ]);

    Storage::disk('public')->assertMissing('materials/modules/materi-besar.pdf');
});
