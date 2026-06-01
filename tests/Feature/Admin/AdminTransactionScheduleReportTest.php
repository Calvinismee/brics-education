<?php

use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('TC_ADMIN_TRX_001 admin dapat melihat daftar transaksi', function () {
    // Dokumentasi: admin membuka menu transaksi dengan data transaksi; expected daftar dan stats transaksi tampil.
    $admin = adminUser();
    transactionRecord([
        'invoice_number' => 'INV-ADMIN-001',
        'payment_status' => 'success',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.transactions'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Transactions')
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', 'INV-ADMIN-001')
            ->has('stats'));
});

test('TC_ADMIN_TRX_002 admin dapat melihat detail transaksi', function () {
    // Dokumentasi: admin membuka detail transaksi dari daftar; expected data invoice, siswa, course, status, dan nominal tampil lengkap.
    $admin = adminUser();
    $student = studentUser([
        'name' => 'Siswa Detail',
        'email' => 'siswa.detail@example.test',
    ]);
    $course = courseRecord([
        'title' => 'Paket Detail',
        'description' => 'Course untuk verifikasi detail transaksi.',
    ]);
    $transaction = transactionRecord([
        'student' => $student,
        'course' => $course,
        'invoice_number' => 'INV-DETAIL-001',
        'amount' => 75000,
        'payment_method' => 'bank_transfer',
        'payment_status' => 'success',
        'payment_gateway_ref' => 'PG-DETAIL-001',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.transactions.show', $transaction['id']));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/TransactionDetail')
            ->where('transaction.invoiceNumber', 'INV-DETAIL-001')
            ->where('transaction.student', 'Siswa Detail')
            ->where('transaction.studentEmail', 'siswa.detail@example.test')
            ->where('transaction.course', 'Paket Detail')
            ->where('transaction.amountFormatted', 'Rp 75.000')
            ->where('transaction.method', 'bank_transfer')
            ->where('transaction.status', 'success')
            ->where('transaction.gatewayReference', 'PG-DETAIL-001'));
});

test('TC_ADMIN_TRX_003 admin dapat filter transaksi berdasarkan status', function () {
    // Dokumentasi: admin membuka transaksi dengan query status pending; expected hanya transaksi pending tampil.
    $admin = adminUser();

    transactionRecord([
        'invoice_number' => 'INV-STATUS-SUCCESS',
        'payment_status' => 'success',
    ]);

    transactionRecord([
        'invoice_number' => 'INV-STATUS-PENDING',
        'payment_status' => 'pending',
    ]);

    transactionRecord([
        'invoice_number' => 'INV-STATUS-FAILED',
        'payment_status' => 'failed',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.transactions', [
        'status' => 'pending',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Transactions')
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', 'INV-STATUS-PENDING')
            ->where('transactions.data.0.status', 'pending')
            ->where('filters.status', 'pending'));
});

test('TC_ADMIN_TRX_004 pencarian transaksi berdasarkan nama siswa menampilkan hasil kosong jika tidak ditemukan', function () {
    // Dokumentasi: admin mencari nama siswa yang tidak punya transaksi; expected daftar transaksi kosong dan filter search dipertahankan.
    $admin = adminUser();
    $student = studentUser(['name' => 'Siswa Terdaftar']);

    transactionRecord([
        'student' => $student,
        'invoice_number' => 'INV-SEARCH-EMPTY',
        'payment_status' => 'success',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.transactions', [
        'search' => 'Nama Tidak Ada',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Transactions')
            ->has('transactions.data', 0)
            ->where('filters.search', 'Nama Tidak Ada'));
});

test('TC_ADMIN_JADWAL_001 admin berhasil membuat jadwal bimbingan', function () {
    // Dokumentasi: admin POST jadwal dengan course/tutor/tanggal/jam valid; expected jadwal tersimpan.
    $admin = adminUser();
    $course = courseRecord(['title' => 'Paket SNBT']);
    $tutor = tutorUser(['name' => 'Fajar Tutor']);

    $response = $this->actingAs($admin)->post(route('admin.schedule.store'), [
        'course' => $course['title'],
        'tutor_id' => $tutor->id,
        'type' => 'live',
        'schedule_date' => '2026-05-20',
        'start_time' => '19:00',
        'end_time' => '20:30',
        'meeting_link' => 'https://zoom.us/j/123456789',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.schedule', absolute: false));

    $this->assertDatabaseHas('schedules', [
        'course_id' => $course['id'],
        'mentor_id' => $tutor->id,
        'title' => 'Paket SNBT',
        'meeting_link' => 'https://zoom.us/j/123456789',
    ]);
});

test('TC_ADMIN_JADWAL_002 jadwal gagal dibuat jika waktu kosong', function () {
    // Dokumentasi: admin POST jadwal tanpa tanggal/jam; expected validasi schedule_date/start_time/end_time.
    $admin = adminUser();
    $course = courseRecord(['title' => 'Paket SNBT']);
    $tutor = tutorUser();

    $response = $this->actingAs($admin)->from(route('admin.schedule'))->post(route('admin.schedule.store'), [
        'course' => $course['title'],
        'tutor_id' => $tutor->id,
        'type' => 'live',
        'schedule_date' => '',
        'start_time' => '',
        'end_time' => '',
        'meeting_link' => 'https://zoom.us/j/123456789',
    ]);

    $response
        ->assertRedirect(route('admin.schedule', absolute: false))
        ->assertSessionHasErrors(['schedule_date', 'start_time', 'end_time']);
});

test('TC_ADMIN_JADWAL_003 deadline tutor disimpan sebagai satu waktu deadline', function () {
    // Dokumentasi: deadline upload tutor hanya memerlukan tanggal dan jam deadline; expected start/end tersimpan pada titik waktu yang sama.
    $admin = adminUser();
    $course = courseRecord(['title' => 'Penalaran Umum']);
    $tutor = tutorUser(['mentor_course_id' => $course['id']]);

    $response = $this->actingAs($admin)->post(route('admin.schedule.store'), [
        'course_id' => $course['id'],
        'tutor_id' => $tutor->id,
        'type' => 'deadline',
        'schedule_date' => '2026-06-05',
        'deadline_time' => '21:00',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.schedule', absolute: false));

    $this->assertDatabaseHas('schedules', [
        'course_id' => $course['id'],
        'mentor_id' => $tutor->id,
        'type' => 'deadline',
        'audience' => 'tutor',
        'start_time' => '2026-06-05 21:00:00',
        'end_time' => '2026-06-05 21:00:00',
    ]);
});

test('TC_ADMIN_JADWAL_004 tryout paket tampil untuk siswa yang terdaftar pada paket', function () {
    // Dokumentasi: admin menjadwalkan satu tryout paket; expected record tidak terikat subtes dan siswa paket melihat jadwal yang sama.
    $admin = adminUser();
    $student = studentUser();
    $course = courseRecord(['title' => 'Penalaran Umum']);
    $package = packageRecord([
        'name' => 'Paket Intensif SNBT',
        'courses' => [$course],
    ]);
    $scheduleDate = now('Asia/Jakarta')->startOfWeek()->addDay()->format('Y-m-d');

    DB::table('enrollments')->insert([
        'user_id' => $student->id,
        'course_id' => $course['id'],
        'package_id' => $package->id,
        'status' => 'active',
        'enrolled_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->actingAs($admin)->post(route('admin.schedule.store'), [
        'package_id' => $package->id,
        'type' => 'tryout',
        'schedule_date' => $scheduleDate,
        'start_time' => '09:00',
        'end_time' => '11:00',
        'action_link' => 'https://tryout.example.test/paket-intensif',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.schedule', absolute: false));

    $this->assertDatabaseHas('schedules', [
        'course_id' => null,
        'package_id' => $package->id,
        'mentor_id' => null,
        'title' => 'Tryout Paket Intensif SNBT',
        'type' => 'tryout',
        'audience' => 'student',
        'action_link' => 'https://tryout.example.test/paket-intensif',
    ]);

    $this->actingAs($student)
        ->get(route('student.schedules'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentSchedules')
            ->has('schedules', 1)
            ->where('schedules.0.type', 'tryout')
            ->where('schedules.0.package.id', $package->id));
});

test('TC_ADMIN_JADWAL_005 review materi tutor disimpan sebagai satu waktu review', function () {
    // Dokumentasi: pengingat review materi tutor hanya memerlukan tanggal dan jam review; expected start/end tersimpan pada titik waktu yang sama.
    $admin = adminUser();
    $course = courseRecord(['title' => 'Pemahaman Bacaan dan Menulis']);
    $tutor = tutorUser(['mentor_course_id' => $course['id']]);

    $response = $this->actingAs($admin)->post(route('admin.schedule.store'), [
        'course_id' => $course['id'],
        'tutor_id' => $tutor->id,
        'type' => 'review',
        'schedule_date' => '2026-06-06',
        'deadline_time' => '15:30',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.schedule', absolute: false));

    $this->assertDatabaseHas('schedules', [
        'course_id' => $course['id'],
        'mentor_id' => $tutor->id,
        'type' => 'review',
        'audience' => 'tutor',
        'start_time' => '2026-06-06 15:30:00',
        'end_time' => '2026-06-06 15:30:00',
    ]);
});

test('TC_ADMIN_LAPORAN_001 admin dapat melihat laporan transaksi yang tersedia', function () {
    // Dokumentasi: admin membuka route laporan/export yang tersedia; expected halaman laporan export ter-render.
    $admin = adminUser();

    DB::table('report_exports')->insert([
        'user_id' => $admin->id,
        'type' => 'Transaksi',
        'title' => 'Export Transaksi',
        'file_name' => 'transactions-test.csv',
        'row_count' => 3,
        'filters' => json_encode(['status' => 'success']),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('admin.reports.export'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ReportsExport')
            ->has('reports', 1)
            ->where('reports.0.title', 'Export Transaksi')
            ->where('reports.0.rowCount', 3)
            ->where('stats.availableReports', 1));
});

test('TC_ADMIN_LAPORAN_002 admin dapat filter laporan berdasarkan periode', function () {
    // Dokumentasi: admin membuka laporan dengan dateFrom/dateTo; expected hanya export pada periode tersebut yang tampil.
    $admin = adminUser();

    DB::table('report_exports')->insert([
        [
            'user_id' => $admin->id,
            'type' => 'Transaksi',
            'title' => 'Export Periode Mei',
            'file_name' => 'transactions-may.csv',
            'row_count' => 5,
            'filters' => json_encode(['status' => 'success']),
            'created_at' => '2026-05-10 10:00:00',
            'updated_at' => '2026-05-10 10:00:00',
        ],
        [
            'user_id' => $admin->id,
            'type' => 'Transaksi',
            'title' => 'Export Periode April',
            'file_name' => 'transactions-april.csv',
            'row_count' => 2,
            'filters' => json_encode(['status' => 'pending']),
            'created_at' => '2026-04-10 10:00:00',
            'updated_at' => '2026-04-10 10:00:00',
        ],
    ]);

    $response = $this->actingAs($admin)->get(route('admin.reports.export', [
        'dateFrom' => '2026-05-01',
        'dateTo' => '2026-05-31',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ReportsExport')
            ->has('reports', 1)
            ->where('reports.0.title', 'Export Periode Mei')
            ->where('filters.dateFrom', '2026-05-01')
            ->where('filters.dateTo', '2026-05-31')
            ->where('stats.availableReports', 1));
});

test('TC_ADMIN_LAPORAN_003 laporan kosong pada periode tanpa transaksi', function () {
    // Dokumentasi: admin memfilter periode tanpa histori export; expected halaman tetap tampil dengan daftar kosong.
    $admin = adminUser();

    DB::table('report_exports')->insert([
        'user_id' => $admin->id,
        'type' => 'Transaksi',
        'title' => 'Export Luar Periode',
        'file_name' => 'transactions-outside.csv',
        'row_count' => 4,
        'filters' => json_encode(['status' => 'success']),
        'created_at' => '2026-04-10 10:00:00',
        'updated_at' => '2026-04-10 10:00:00',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.reports.export', [
        'dateFrom' => '2026-05-01',
        'dateTo' => '2026-05-31',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ReportsExport')
            ->has('reports', 0)
            ->where('filters.dateFrom', '2026-05-01')
            ->where('filters.dateTo', '2026-05-31')
            ->where('stats.availableReports', 0));
});
