<?php

use App\Services\PackageEnrollmentService;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('admin dapat melihat overview course berisi siswa mentor dan konten', function () {
    // Dokumentasi: admin membuka halaman course overview; expected relasi enrollment, mentor, dan konten tersaji per course.
    $admin = adminUser();
    $student = studentUser(['name' => 'Siswa Course']);
    $mentor = tutorUser(['name' => 'Mentor Course']);
    $course = courseRecord(['title' => 'Matematika Dasar']);
    $package = packageRecord([
        'name' => 'Paket Matematika',
        'courses' => [$course],
    ]);

    app(PackageEnrollmentService::class)->enroll($student, $package);

    DB::table('users')->where('id', $mentor->id)->update([
        'mentor_course_id' => $course['id'],
        'updated_at' => now(),
    ]);

    materialRecord([
        'course' => $course,
        'tutor' => $mentor,
        'title' => 'Materi Matematika',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.courses'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses')
            ->has('courses', 1)
            ->where('courses.0.title', 'Matematika Dasar')
            ->where('courses.0.students.0.name', 'Siswa Course')
            ->where('courses.0.mentors.0.name', 'Mentor Course')
            ->where('courses.0.contents.0.title', 'Materi Matematika'));
});

test('admin dapat membuat paket dengan banyak course dan course dapat dipakai di banyak paket', function () {
    // Dokumentasi: relasi package-course bersifat many-to-many; satu paket berisi banyak course dan satu course bisa muncul di banyak paket.
    $admin = adminUser();
    $math = courseRecord(['title' => 'Matematika Dasar']);
    $science = courseRecord(['title' => 'IPA Terpadu']);

    $this->actingAs($admin)->post(route('admin.packages.store'), [
        'name' => 'Paket STEM',
        'price' => '250000',
        'description' => 'Paket gabungan matematika dan IPA.',
        'features' => ['Live class', 'Latihan soal'],
        'course_ids' => [$math['id'], $science['id']],
        'popular' => true,
    ])->assertSessionHasNoErrors();

    $firstPackageId = DB::table('packages')->where('name', 'Paket STEM')->value('id');

    $this->assertDatabaseHas('package_course', [
        'package_id' => $firstPackageId,
        'course_id' => $math['id'],
    ]);
    $this->assertDatabaseHas('package_course', [
        'package_id' => $firstPackageId,
        'course_id' => $science['id'],
    ]);

    $this->actingAs($admin)->post(route('admin.packages.store'), [
        'name' => 'Paket Matematika Intensif',
        'price' => '150000',
        'description' => 'Paket tambahan untuk matematika.',
        'features' => ['Pembahasan intensif'],
        'course_ids' => [$math['id']],
        'popular' => false,
    ])->assertSessionHasNoErrors();

    expect(DB::table('package_course')->where('course_id', $math['id'])->count())->toBe(2);
});

test('siswa yang membeli paket terenroll ke semua course dalam paket', function () {
    // Dokumentasi: setelah paket berhasil dibeli, enrollment dibuat untuk setiap course yang menjadi anggota paket tersebut.
    $student = studentUser();
    $math = courseRecord(['title' => 'Matematika Dasar']);
    $science = courseRecord(['title' => 'IPA Terpadu']);
    $package = packageRecord([
        'name' => 'Paket STEM',
        'courses' => [$math, $science],
    ]);

    app(PackageEnrollmentService::class)->enroll($student, $package);

    foreach ([$math, $science] as $course) {
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'course_id' => $course['id'],
            'package_id' => $package->id,
            'status' => 'active',
        ]);
    }
});

test('satu mentor hanya dapat dijadwalkan untuk satu course yang ditugaskan', function () {
    // Dokumentasi: mentor pertama kali dijadwalkan akan ditugaskan ke course tersebut; jadwal course lain dengan mentor sama ditolak.
    $admin = adminUser();
    $mentor = tutorUser(['name' => 'Mentor Matematika']);
    $math = courseRecord(['title' => 'Matematika Dasar']);
    $science = courseRecord(['title' => 'IPA Terpadu']);

    $this->actingAs($admin)->post(route('admin.schedule.store'), [
        'course' => $math['title'],
        'tutor_id' => $mentor->id,
        'type' => 'live',
        'schedule_date' => '2026-05-20',
        'start_time' => '08:00',
        'end_time' => '09:30',
        'meeting_link' => 'https://zoom.us/j/111',
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('users', [
        'id' => $mentor->id,
        'mentor_course_id' => $math['id'],
    ]);

    $this->actingAs($admin)->from(route('admin.schedule'))->post(route('admin.schedule.store'), [
        'course' => $science['title'],
        'tutor_id' => $mentor->id,
        'type' => 'live',
        'schedule_date' => '2026-05-21',
        'start_time' => '10:00',
        'end_time' => '11:30',
        'meeting_link' => 'https://zoom.us/j/222',
    ])->assertSessionHasErrors('tutor_id');
});
