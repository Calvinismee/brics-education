<?php

test('tutor dapat membuat jadwal untuk course yang diampu', function () {
    $course = courseRecord(['title' => 'Penalaran Umum']);
    $tutor = tutorUser([
        'name' => 'Tutor Jadwal',
        'mentor_course_id' => $course['id'],
    ]);

    $response = $this->actingAs($tutor)->post(route('tutor.schedule.store'), [
        'course_id' => $course['id'],
        'title' => 'Live Class Penalaran Umum',
        'type' => 'live',
        'schedule_date' => '2026-06-01',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'meeting_link' => 'https://meet.google.com/abc-defg-hij',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('tutor.schedule', absolute: false));

    $this->assertDatabaseHas('schedules', [
        'course_id' => $course['id'],
        'mentor_id' => $tutor->id,
        'title' => 'Live Class Penalaran Umum',
        'meeting_link' => 'https://meet.google.com/abc-defg-hij',
    ]);
});

test('tutor tidak dapat membuat jadwal untuk course yang tidak diampu', function () {
    $assignedCourse = courseRecord(['title' => 'Penalaran Umum']);
    $otherCourse = courseRecord(['title' => 'Literasi Bahasa Inggris']);
    $tutor = tutorUser(['mentor_course_id' => $assignedCourse['id']]);

    $response = $this->actingAs($tutor)->from(route('tutor.schedule'))->post(route('tutor.schedule.store'), [
        'course_id' => $otherCourse['id'],
        'title' => 'Live Class Course Lain',
        'type' => 'live',
        'schedule_date' => '2026-06-01',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'meeting_link' => 'https://meet.google.com/abc-defg-hij',
    ]);

    $response
        ->assertRedirect(route('tutor.schedule', absolute: false))
        ->assertSessionHasErrors('course_id');

    $this->assertDatabaseMissing('schedules', [
        'course_id' => $otherCourse['id'],
        'mentor_id' => $tutor->id,
        'title' => 'Live Class Course Lain',
    ]);
});

test('tutor dapat membuat deadline tugas yang hanya tampil untuk siswa', function () {
    $course = courseRecord(['title' => 'Pemahaman Bacaan dan Menulis']);
    $tutor = tutorUser([
        'name' => 'Tutor Tugas',
        'mentor_course_id' => $course['id'],
    ]);

    $response = $this->actingAs($tutor)->post(route('tutor.schedule.store'), [
        'course_id' => $course['id'],
        'title' => 'Tugas Latihan Struktur Paragraf',
        'type' => 'student_deadline',
        'schedule_date' => '2026-06-02',
        'deadline_time' => '20:00',
        'action_link' => 'https://forms.gle/example-assignment',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('tutor.schedule', absolute: false));

    $this->assertDatabaseHas('schedules', [
        'course_id' => $course['id'],
        'mentor_id' => $tutor->id,
        'type' => 'student_deadline',
        'audience' => 'student',
        'action_link' => 'https://forms.gle/example-assignment',
        'meeting_link' => null,
    ]);
});

test('tutor wajib mengisi link form saat membuat deadline tugas siswa', function () {
    $course = courseRecord(['title' => 'Pengetahuan dan Pemahaman Umum']);
    $tutor = tutorUser(['mentor_course_id' => $course['id']]);

    $response = $this->actingAs($tutor)->from(route('tutor.schedule'))->post(route('tutor.schedule.store'), [
        'course_id' => $course['id'],
        'title' => 'Tugas Latihan Kosakata',
        'type' => 'student_deadline',
        'schedule_date' => '2026-06-03',
        'deadline_time' => '21:00',
    ]);

    $response
        ->assertRedirect(route('tutor.schedule', absolute: false))
        ->assertSessionHasErrors('action_link');

    $this->assertDatabaseMissing('schedules', [
        'course_id' => $course['id'],
        'mentor_id' => $tutor->id,
        'title' => 'Tugas Latihan Kosakata',
    ]);
});
