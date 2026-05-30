<?php

use App\Support\DatabaseBoolean;
use Illuminate\Support\Facades\DB;

test('TC_TUTOR_NOTIF_001 tutor mengirim announcement ke siswa', function () {
    [$course, $tutor] = tutorCourseScenario();
    $student = studentUser([
        'name' => 'Siswa Penerima',
        'email' => 'siswa-penerima@example.test',
    ]);
    activeEnrollmentForTutorTest($student, $course);

    $response = $this->actingAs($tutor)->from(route('tutor.upload'))->post(route('tutor.announcements.store'), [
        'course_id' => $course['id'],
        'title' => 'Info Kelas',
        'message' => 'Jangan lupa ikut sesi malam ini.',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('tutor.upload', absolute: false));

    $this->assertDatabaseHas('notifications', [
        'user_id' => $student->id,
        'title' => 'Pengumuman Fajar Tutor: Info Kelas',
        'message' => 'Penalaran Umum - Jangan lupa ikut sesi malam ini.',
        'is_read' => DatabaseBoolean::value(false),
    ]);
});
