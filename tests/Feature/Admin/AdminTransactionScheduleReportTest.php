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
