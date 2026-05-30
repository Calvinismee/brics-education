<?php

use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('TC_TUTOR_DASH_001 dashboard tutor tampil setelah login', function () {
    [$course, $tutor] = tutorCourseScenario();

    $this->actingAs($tutor)
        ->get(route('tutor.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Tutor/TutorDashboard')
            ->where('user.id', $tutor->id)
            ->where('tutorClasses.0.title', $course['title']));
});

test('TC_TUTOR_KELAS_001 tutor dapat melihat kelas yang diampu', function () {
    [$course, $tutor] = tutorCourseScenario();

    $this->actingAs($tutor)
        ->get(route('tutor.classes'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Tutor/TutorClassMonitoring')
            ->where('classes.0.title', $course['title'])
            ->where('selectedClassId', $course['id']));
});

test('TC_TUTOR_DETAIL_001 tutor dapat melihat detail kelas', function () {
    [$course, $tutor] = tutorCourseScenario();

    $this->actingAs($tutor)
        ->get(route('tutor.classes.show', Str::slug($course['title'])))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Tutor/TutorClassMonitoring')
            ->where('selectedClassId', $course['id'])
            ->where('classes.0.title', $course['title'])
            ->has('stats'));
});

test('TC_TUTOR_PESERTA_001 tutor dapat melihat daftar peserta kelas', function () {
    [$course, $tutor] = tutorCourseScenario();
    $student = studentUser([
        'name' => 'Siswa Kelas Tutor',
        'email' => 'siswa-kelas@example.test',
    ]);
    activeEnrollmentForTutorTest($student, $course);

    $this->actingAs($tutor)
        ->get(route('tutor.classes.show', Str::slug($course['title'])))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Tutor/TutorClassMonitoring')
            ->has('students', 1)
            ->where('students.0.name', 'Siswa Kelas Tutor')
            ->where('stats.totalStudents', 1));
});

test('TC_TUTOR_PESERTA_002 tutor melihat daftar peserta kosong', function () {
    [$course, $tutor] = tutorCourseScenario();

    $this->actingAs($tutor)
        ->get(route('tutor.classes.show', Str::slug($course['title'])))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Tutor/TutorClassMonitoring')
            ->has('students', 0)
            ->where('stats.totalStudents', 0));
});

test('TC_TUTOR_JADWAL_001 tutor dapat melihat jadwal kelas yang diampu', function () {
    [$course, $tutor] = tutorCourseScenario();
    tutorScheduleForTest($tutor, $course);

    $this->actingAs($tutor)
        ->get(route('tutor.schedule'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Tutor/TutorSchedule')
            ->where('stats.totalThisWeek', 1)
            ->where('stats.totalLive', 1)
            ->where('tutorClasses.0.title', $course['title']));
});

test('TC_TUTOR_JADWAL_002 tutor melihat jadwal kosong', function () {
    [$course, $tutor] = tutorCourseScenario();

    $this->actingAs($tutor)
        ->get(route('tutor.schedule'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Tutor/TutorSchedule')
            ->where('stats.totalThisWeek', 0)
            ->where('tutorClasses.0.title', $course['title']));
});

test('TC_TUTOR_PROFIL_001 tutor berhasil mengubah profil', function () {
    [, $tutor] = tutorCourseScenario();

    $response = $this->actingAs($tutor)->patch(route('tutor.profile.update'), [
        'name' => 'Fajar Maulana',
        'phone' => '08123456789',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $tutor->id,
        'name' => 'Fajar Maulana',
        'phone' => '08123456789',
    ]);
});

test('TC_TUTOR_PROFIL_002 update profil gagal jika nama kosong', function () {
    [, $tutor] = tutorCourseScenario(['title' => 'Literasi Bahasa Indonesia'], [
        'name' => 'Nama Tutor Awal',
    ]);

    $response = $this->actingAs($tutor)->from(route('tutor.profile'))->patch(route('tutor.profile.update'), [
        'name' => '',
        'phone' => '08123456789',
    ]);

    $response
        ->assertRedirect(route('tutor.profile', absolute: false))
        ->assertSessionHasErrors('name');

    $this->assertDatabaseHas('users', [
        'id' => $tutor->id,
        'name' => 'Nama Tutor Awal',
    ]);
});

test('TC_TUTOR_ROLE_001 tutor tidak dapat mengakses dashboard admin', function () {
    [, $tutor] = tutorCourseScenario();

    $this->actingAs($tutor)
        ->get(route('admin.dashboard'))
        ->assertRedirect('/')
        ->assertSessionHas('error', 'Unauthorized access');
});

test('TC_TUTOR_ROLE_002 tutor tidak dapat mengakses menu transaksi admin', function () {
    [, $tutor] = tutorCourseScenario();

    $this->actingAs($tutor)
        ->get(route('admin.transactions'))
        ->assertRedirect('/')
        ->assertSessionHas('error', 'Unauthorized access');
});

test('TC_TUTOR_HISTORY_001 tutor dapat melihat riwayat mengajar', function () {
    [$course, $tutor] = tutorCourseScenario();
    $start = now('Asia/Jakarta')->subDays(2)->setTime(9, 0);
    $end = $start->copy()->addMinutes(90);
    $scheduleId = tutorScheduleForTest($tutor, $course, [
        'title' => 'Riwayat Live Class',
        'start_time' => $start->format('Y-m-d H:i:s'),
        'end_time' => $end->format('Y-m-d H:i:s'),
        'started_at' => $start->copy()->addMinute()->format('Y-m-d H:i:s'),
    ]);

    $this->actingAs($tutor)
        ->get(route('tutor.history'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Tutor/TutorHistory')
            ->where('history.data.0.id', $scheduleId)
            ->where('history.data.0.title', 'Riwayat Live Class')
            ->where('stats.totalSessions', 1));
});
