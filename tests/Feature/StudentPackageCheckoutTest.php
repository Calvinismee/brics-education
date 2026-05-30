<?php

use App\Models\Transaction;
use App\Services\PackageEnrollmentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

function signedMidtransPayloadForStudentTest(array $overrides = []): array
{
    $payload = array_merge([
        'order_id' => 'INV-STUDENT-CALLBACK-001',
        'status_code' => '200',
        'gross_amount' => '15000.00',
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
        'fraud_status' => 'accept',
    ], $overrides);

    $payload['signature_key'] = hash(
        'sha512',
        $payload['order_id'].
        $payload['status_code'].
        $payload['gross_amount'].
        config('services.midtrans.server_key')
    );

    return $payload;
}

test('TC_SISWA_KATALOG_001 siswa dapat melihat katalog paket aktif', function () {
    $course = courseRecord([
        'title' => 'Penalaran Umum',
        'status' => 'active',
    ]);
    $package = packageRecord([
        'name' => 'Paket Katalog SNBT',
        'courses' => [$course],
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('LandingPage')
            ->has('packages', 1)
            ->where('packages.0.name', $package->name)
            ->where('packages.0.courses.0.title', 'Penalaran Umum'));
});

test('TC_SISWA_KATALOG_002 pencarian katalog dengan kata kunci valid menampilkan paket terkait', function () {
    $course = courseRecord([
        'title' => 'Tryout SNBT',
        'status' => 'active',
    ]);
    packageRecord([
        'name' => 'Paket Tryout SNBT',
        'courses' => [$course],
    ]);

    $this->get('/?search=Tryout%20SNBT')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('LandingPage')
            ->where('packages.0.name', 'Paket Tryout SNBT')
            ->where('packages.0.courses.0.title', 'Tryout SNBT'));
});

test('TC_SISWA_KATALOG_003 katalog kosong saat tidak ada paket aktif yang tersedia', function () {
    $this->get('/?search=Course%20Tidak%20Ada')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('LandingPage')
            ->has('packages', 0));
});

test('TC_SISWA_DETAIL_001 siswa dapat melihat detail course', function () {
    $course = courseRecord([
        'title' => 'Bundling Tryout UTBK SNBT',
        'price' => 15000,
        'status' => 'active',
    ]);

    $this->get(route('course.detail', Str::slug($course['title'])))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('CourseDetail')
            ->where('course.title', 'Bundling Tryout UTBK SNBT')
            ->where('course.price', '15000.00'));
});

test('TC_SISWA_DETAIL_002 course tidak aktif tidak ditampilkan sebagai paket yang dapat dibeli', function () {
    $course = courseRecord([
        'title' => 'Course Tidak Aktif',
        'status' => 'inactive',
    ]);
    packageRecord([
        'name' => 'Paket Course Tidak Aktif',
        'courses' => [$course],
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('LandingPage')
            ->has('packages', 0));
});

test('TC_SISWA_BELI_001 siswa dapat memulai pembelian paket aktif', function () {
    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    $package = packageRecord([
        'name' => 'Paket Checkout Aktif',
        'courses' => [$course],
    ]);

    $this->actingAs($student)
        ->get(route('checkout.package', $package))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Checkout')
            ->where('learningPackage.name', 'Paket Checkout Aktif'));
});

test('TC_SISWA_BELI_002 guest diarahkan login sebelum membeli paket', function () {
    $course = courseRecord(['status' => 'active']);
    $package = packageRecord(['courses' => [$course]]);

    $this->get(route('checkout.package', $package))
        ->assertRedirect(route('login', absolute: false));
});

test('TC_SISWA_BELI_003 siswa yang sudah enroll tidak mendapat enrollment duplikat', function () {
    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    $package = packageRecord(['courses' => [$course]]);

    app(PackageEnrollmentService::class)->enroll($student, $package);
    app(PackageEnrollmentService::class)->enroll($student, $package);

    expect(DB::table('enrollments')
        ->where('user_id', $student->id)
        ->where('course_id', $course['id'])
        ->count())->toBe(1);
});

test('TC_SISWA_CHECKOUT_001 ringkasan checkout paket tampil dengan benar', function () {
    $student = studentUser();
    $course = courseRecord([
        'title' => 'Paket SNBT Course',
        'status' => 'active',
    ]);
    $package = packageRecord([
        'name' => 'Paket SNBT',
        'price' => '15000',
        'courses' => [$course],
    ]);

    $this->actingAs($student)
        ->get(route('checkout.package', $package))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Checkout')
            ->where('learningPackage.name', 'Paket SNBT')
            ->where('learningPackage.price', '15000')
            ->where('learningPackage.courses.0.title', 'Paket SNBT Course'));
});

test('TC_SISWA_CHECKOUT_002 checkout gagal jika paket tidak memiliki course aktif', function () {
    $student = studentUser();
    $course = courseRecord([
        'status' => 'inactive',
    ]);
    $package = packageRecord([
        'courses' => [$course],
    ]);

    $this->actingAs($student)
        ->from(route('checkout.package', $package))
        ->post(route('checkout'), [
            'package_id' => $package->id,
            'payment_method' => 'qris',
        ])
        ->assertRedirect(route('checkout.package', $package, false))
        ->assertSessionHasErrors('package_id');

    expect(DB::table('transactions')->where('user_id', $student->id)->count())->toBe(0);
});

test('TC_SISWA_PAY_001 pembayaran berhasil mengaktifkan akses course', function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    $student = studentUser();
    $course = courseRecord([
        'title' => 'Penalaran Matematika',
        'status' => 'active',
    ]);
    $package = packageRecord(['courses' => [$course]]);

    transactionRecord([
        'student' => $student,
        'package' => $package,
        'course_id' => null,
        'invoice_number' => 'INV-STUDENT-CALLBACK-001',
        'amount' => 15000,
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    $this->postJson(route('midtrans.notification'), signedMidtransPayloadForStudentTest())
        ->assertOk()
        ->assertJson(['message' => 'OK']);

    $this->assertDatabaseHas('transactions', [
        'invoice_number' => 'INV-STUDENT-CALLBACK-001',
        'payment_status' => 'success',
    ]);
    $this->assertDatabaseHas('enrollments', [
        'user_id' => $student->id,
        'course_id' => $course['id'],
        'package_id' => $package->id,
        'status' => 'active',
    ]);
});

test('TC_SISWA_PAY_002 pembayaran pending tersimpan dan tampil di status pembayaran', function () {
    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    $package = packageRecord(['courses' => [$course]]);

    transactionRecord([
        'student' => $student,
        'package' => $package,
        'course_id' => null,
        'invoice_number' => 'INV-STUDENT-PENDING-001',
        'payment_status' => 'pending',
        'payment_gateway_ref' => 'snap-token-pending',
        'paid_at' => null,
    ]);

    $this->actingAs($student)
        ->get(route('payment.status', 'INV-STUDENT-PENDING-001'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('PaymentStatus')
            ->where('transaction.invoice_number', 'INV-STUDENT-PENDING-001')
            ->where('transaction.payment_status', 'pending')
            ->where('midtrans.snapToken', 'snap-token-pending'));
});

test('TC_SISWA_PAY_003 pembayaran gagal dicatat sebagai failed', function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    $student = studentUser();
    $course = courseRecord(['status' => 'active']);

    transactionRecord([
        'student' => $student,
        'course' => $course,
        'invoice_number' => 'INV-STUDENT-FAILED-001',
        'amount' => 15000,
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    $this->postJson(route('midtrans.notification'), signedMidtransPayloadForStudentTest([
        'order_id' => 'INV-STUDENT-FAILED-001',
        'transaction_status' => 'failure',
    ]))->assertOk();

    $this->assertDatabaseHas('transactions', [
        'invoice_number' => 'INV-STUDENT-FAILED-001',
        'payment_status' => 'failed',
        'paid_at' => null,
    ]);
    expect(DB::table('enrollments')->where('user_id', $student->id)->count())->toBe(0);
});

test('TC_SISWA_PAY_004 gateway gagal tidak menganggap transaksi berhasil', function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    transactionRecord([
        'student' => $student,
        'course' => $course,
        'invoice_number' => 'INV-STUDENT-GATEWAY-001',
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    Http::fake([
        'https://api.sandbox.midtrans.com/v2/INV-STUDENT-GATEWAY-001/status' => Http::response([], 500),
    ]);

    $this->actingAs($student)
        ->from(route('payment.status', 'INV-STUDENT-GATEWAY-001'))
        ->post(route('payment.refresh', 'INV-STUDENT-GATEWAY-001'))
        ->assertRedirect(route('payment.status', 'INV-STUDENT-GATEWAY-001', false))
        ->assertSessionHasErrors('payment');

    $this->assertDatabaseHas('transactions', [
        'invoice_number' => 'INV-STUDENT-GATEWAY-001',
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);
});

test('TC_SISWA_ENROLL_001 siswa berhasil enroll setelah pembayaran berhasil', function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    $package = packageRecord(['courses' => [$course]]);

    transactionRecord([
        'student' => $student,
        'package' => $package,
        'course_id' => null,
        'invoice_number' => 'INV-STUDENT-ENROLL-001',
        'amount' => 15000,
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    $this->postJson(route('midtrans.notification'), signedMidtransPayloadForStudentTest([
        'order_id' => 'INV-STUDENT-ENROLL-001',
    ]))->assertOk();

    $this->assertDatabaseHas('enrollments', [
        'user_id' => $student->id,
        'course_id' => $course['id'],
        'status' => 'active',
    ]);
});

test('TC_SISWA_ENROLL_002 akses course ditolak jika siswa belum membayar', function () {
    $student = studentUser();
    $course = courseRecord([
        'title' => 'Course Belum Dibayar',
        'status' => 'active',
    ]);

    $this->actingAs($student)
        ->get(route('course.learn', Str::slug($course['title'])))
        ->assertRedirect(route('course.detail', Str::slug($course['title']), false))
        ->assertSessionHasErrors('course');
});

test('TC_SISWA_ENROLL_003 enrollment ulang tidak membuat data ganda', function () {
    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    $package = packageRecord(['courses' => [$course]]);

    app(PackageEnrollmentService::class)->enroll($student, $package);
    app(PackageEnrollmentService::class)->enroll($student, $package);

    expect(DB::table('enrollments')
        ->where('user_id', $student->id)
        ->where('course_id', $course['id'])
        ->count())->toBe(1);
});

test('TC_SISWA_MATERI_001 siswa dapat mengakses materi jika sudah enroll', function () {
    $student = studentUser();
    $course = courseRecord([
        'title' => 'Materi Aktif',
        'status' => 'active',
    ]);
    $package = packageRecord(['courses' => [$course]]);
    app(PackageEnrollmentService::class)->enroll($student, $package);

    materialRecord([
        'course' => $course,
        'title' => 'Materi TPS Disetujui',
        'approval_status' => 'approved',
    ]);

    $this->actingAs($student)
        ->get(route('course.learn', Str::slug($course['title'])))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('CourseLearn')
            ->where('course.title', 'Materi Aktif')
            ->where('materials.0.title', 'Materi TPS Disetujui'));
});

test('TC_SISWA_MATERI_002 akses materi ditolak jika siswa belum enroll', function () {
    $student = studentUser();
    $course = courseRecord([
        'title' => 'Materi Terkunci',
        'status' => 'active',
    ]);

    materialRecord([
        'course' => $course,
        'title' => 'Materi Belum Bisa Diakses',
        'approval_status' => 'approved',
    ]);

    $this->actingAs($student)
        ->get(route('course.learn', Str::slug($course['title'])))
        ->assertRedirect(route('course.detail', Str::slug($course['title']), false))
        ->assertSessionHasErrors('course');
});

test('TC_SISWA_MATERI_003 sistem menampilkan not found saat materi atau course tidak ditemukan', function () {
    $student = studentUser();

    $this->actingAs($student)
        ->get(route('course.learn', 'materi-tidak-ada'))
        ->assertNotFound();
});

test('TC_SISWA_JADWAL_001 siswa dapat melihat jadwal bimbingan', function () {
    $student = studentUser();
    [$course, $tutor] = tutorCourseScenario([
        'title' => 'Jadwal Siswa',
        'status' => 'active',
    ]);
    activeEnrollmentForTutorTest($student, $course);
    tutorScheduleForTest($tutor, $course, [
        'title' => 'Live Class Siswa',
    ]);

    $this->actingAs($student)
        ->get(route('student.schedules'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentSchedules')
            ->where('scheduleStats.totalThisWeek', 1)
            ->where('schedules.0.title', 'Live Class Siswa'));
});

test('TC_SISWA_JADWAL_002 siswa melihat jadwal kosong', function () {
    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    activeEnrollmentForTutorTest($student, $course);

    $this->actingAs($student)
        ->get(route('student.schedules'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentSchedules')
            ->has('schedules', 0)
            ->where('scheduleStats.totalThisWeek', 0));
});

test('TC_SISWA_RIWAYAT_001 siswa dapat melihat riwayat transaksi', function () {
    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    $package = packageRecord(['courses' => [$course]]);
    transactionRecord([
        'student' => $student,
        'package' => $package,
        'course_id' => null,
        'invoice_number' => 'INV-RIWAYAT-001',
        'payment_status' => 'success',
    ]);

    $this->actingAs($student)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentDashboard')
            ->has('transactions', 1)
            ->where('transactions.0.invoice_number', 'INV-RIWAYAT-001'));
});

test('TC_SISWA_RIWAYAT_002 siswa baru melihat riwayat transaksi kosong', function () {
    $student = studentUser();

    $this->actingAs($student)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentDashboard')
            ->has('transactions', 0));
});

test('TC_SISWA_DASH_001 dashboard siswa menampilkan informasi utama', function () {
    $student = studentUser();
    [$course, $tutor] = tutorCourseScenario([
        'title' => 'Dashboard Aktif',
        'status' => 'active',
    ]);
    $package = packageRecord([
        'name' => 'Paket Dashboard Aktif',
        'courses' => [$course],
    ]);
    app(PackageEnrollmentService::class)->enroll($student, $package);
    materialRecord([
        'course' => $course,
        'title' => 'Materi Dashboard',
        'approval_status' => 'approved',
    ]);
    tutorScheduleForTest($tutor, $course, [
        'title' => 'Jadwal Dashboard',
    ]);
    transactionRecord([
        'student' => $student,
        'package' => $package,
        'course_id' => null,
        'invoice_number' => 'INV-DASH-001',
    ]);

    $this->actingAs($student)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentDashboard')
            ->has('enrollments', 1)
            ->has('materials', 1)
            ->has('schedules', 1)
            ->has('transactions', 1)
            ->where('enrollments.0.package.name', 'Paket Dashboard Aktif'));
});

test('TC_SISWA_DASH_002 dashboard siswa tanpa course aktif menampilkan pilihan paket', function () {
    $student = studentUser();
    $course = courseRecord(['status' => 'active']);
    $package = packageRecord([
        'name' => 'Paket Untuk Siswa Baru',
        'courses' => [$course],
    ]);

    $this->actingAs($student)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentDashboard')
            ->has('enrollments', 0)
            ->where('availablePackages.0.name', $package->name));
});

test('TC_SISWA_ROLE_001 siswa tidak dapat mengakses dashboard admin', function () {
    $student = studentUser();

    $this->actingAs($student)
        ->get(route('admin.dashboard'))
        ->assertRedirect('/')
        ->assertSessionHas('error', 'Unauthorized access');
});
