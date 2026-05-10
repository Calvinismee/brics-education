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

test('admin dapat mencari transaksi berdasarkan nama siswa', function () {
    // Dokumentasi: admin membuka transaksi dengan query search nama siswa; expected hanya transaksi siswa tersebut tampil.
    $admin = adminUser();
    $matchedStudent = studentUser(['name' => 'Nasywa Azzahra']);
    $otherStudent = studentUser(['name' => 'Julius Calvin']);

    transactionRecord([
        'student' => $matchedStudent,
        'invoice_number' => 'INV-NAME-001',
        'payment_status' => 'success',
    ]);

    transactionRecord([
        'student' => $otherStudent,
        'invoice_number' => 'INV-NAME-002',
        'payment_status' => 'success',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.transactions', [
        'search' => 'Nasywa',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Transactions')
            ->has('transactions.data', 1)
            ->where('transactions.data.0.student', 'Nasywa Azzahra')
            ->where('filters.search', 'Nasywa'));
});

test('admin dapat export transaksi sebagai CSV', function () {
    // Dokumentasi: admin membuka route export transaksi; expected file CSV transaksi terunduh.
    $admin = adminUser();
    $student = studentUser(['name' => 'Siswa Export']);

    transactionRecord([
        'student' => $student,
        'invoice_number' => 'INV-EXPORT-001',
        'payment_status' => 'success',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.transactions.export', [
        'status' => 'success',
        'search' => 'Siswa Export',
    ]));

    $response
        ->assertOk()
        ->assertDownload();

    expect($response->streamedContent())
        ->toContain('Invoice')
        ->toContain('INV-EXPORT-001');

    $this->assertDatabaseHas('report_exports', [
        'type' => 'Transaksi',
        'title' => 'Export Transaksi',
        'row_count' => 1,
    ]);
});

test('TC_ADMIN_JADWAL_001 admin berhasil membuat jadwal bimbingan', function () {
    // Dokumentasi: admin POST jadwal dengan course/tutor/tanggal/jam valid; expected jadwal tersimpan.
    $admin = adminUser();
    $course = courseRecord(['title' => 'Paket SNBT']);
    $tutor = tutorUser(['name' => 'Fajar Tutor']);

    $response = $this->actingAs($admin)->post(route('admin.schedule.store'), [
        'course' => $course['title'],
        'tutor_id' => $tutor->id,
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
        'schedule_date' => '',
        'start_time' => '',
        'end_time' => '',
        'meeting_link' => 'https://zoom.us/j/123456789',
    ]);

    $response
        ->assertRedirect(route('admin.schedule', absolute: false))
        ->assertSessionHasErrors(['schedule_date', 'start_time', 'end_time']);
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
