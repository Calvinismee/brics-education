<?php

use App\Models\Transaction;
use App\Services\PackageEnrollmentService;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('landing page menampilkan paket aktif, bukan katalog course untuk dibeli', function () {
    $course = courseRecord([
        'title' => 'Penalaran Umum',
        'status' => 'active',
    ]);

    packageRecord([
        'name' => 'Paket Intensif SNBT',
        'price' => '499000',
        'courses' => [$course],
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('LandingPage')
            ->has('packages', 1)
            ->where('packages.0.name', 'Paket Intensif SNBT')
            ->where('packages.0.courses.0.title', 'Penalaran Umum'));
});

test('checkout course lama diarahkan kembali ke katalog paket', function () {
    $course = courseRecord([
        'status' => 'active',
    ]);

    $this->get('/checkout/'.$course['id'])
        ->assertRedirect('/#katalog');
});

test('guest harus login sebelum membuka checkout paket', function () {
    $course = courseRecord([
        'status' => 'active',
    ]);
    $package = packageRecord([
        'courses' => [$course],
    ]);

    $this->get(route('checkout.package', $package))
        ->assertRedirect(route('login', absolute: false));
});

test('student hanya dapat membuat transaksi checkout paket', function () {
    $student = studentUser();
    $course = courseRecord([
        'title' => 'Pengetahuan Kuantitatif',
        'status' => 'active',
    ]);
    $package = packageRecord([
        'name' => 'Paket Persiapan SNBT',
        'price' => '499000',
        'courses' => [$course],
    ]);

    $this->actingAs($student)
        ->post(route('checkout'), [
            'course_id' => $course['id'],
            'payment_method' => 'qris',
        ])
        ->assertSessionHasErrors('package_id');

    $this->assertDatabaseMissing('transactions', [
        'user_id' => $student->id,
        'course_id' => $course['id'],
    ]);

    $response = $this->actingAs($student)
        ->post(route('checkout'), [
            'package_id' => $package->id,
            'payment_method' => 'qris',
        ]);

    $transaction = Transaction::query()->latest('id')->first();

    $response->assertRedirect('/payment-status/'.$transaction->id);

    expect($transaction->user_id)->toBe($student->id);
    expect($transaction->course_id)->toBeNull();
    expect($transaction->package_id)->toBe($package->id);
    expect($transaction->amount)->toBe('499000.00');
    expect($transaction->payment_status)->toBe('pending');
});

test('konfirmasi pembayaran paket mengaktifkan semua course dalam paket', function () {
    $student = studentUser();
    $firstCourse = courseRecord([
        'title' => 'Literasi Bahasa Indonesia',
        'status' => 'active',
    ]);
    $secondCourse = courseRecord([
        'title' => 'Penalaran Matematika',
        'status' => 'active',
    ]);
    $package = packageRecord([
        'courses' => [$firstCourse, $secondCourse],
    ]);

    $transactionId = DB::table('transactions')->insertGetId([
        'user_id' => $student->id,
        'course_id' => null,
        'package_id' => $package->id,
        'enrollment_id' => null,
        'invoice_number' => 'INV-PACKAGE-001',
        'amount' => 15000,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
        'payment_gateway_ref' => null,
        'paid_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->post(route('payment.confirm', $transactionId))
        ->assertRedirect('/payment-status/'.$transactionId);

    foreach ([$firstCourse, $secondCourse] as $course) {
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'course_id' => $course['id'],
            'package_id' => $package->id,
            'status' => 'active',
        ]);
    }

    $transaction = Transaction::query()->findOrFail($transactionId);

    expect($transaction->payment_status)->toBe('success');
    expect($transaction->course_id)->toBeNull();
    expect($transaction->package_id)->toBe($package->id);
    expect($transaction->enrollment_id)->not->toBeNull();
});

test('student tanpa paket aktif tetap masuk dashboard dan melihat pilihan paket', function () {
    $student = studentUser();
    $course = courseRecord([
        'status' => 'active',
    ]);
    $package = packageRecord([
        'name' => 'Paket Dashboard SNBT',
        'courses' => [$course],
    ]);

    $this->actingAs($student)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentDashboard')
            ->has('enrollments', 0)
            ->has('availablePackages', 1)
            ->where('availablePackages.0.name', $package->name));
});

test('student dengan transaksi paket pending tetap masuk dashboard dan menerima data transaksi', function () {
    $student = studentUser();
    $course = courseRecord([
        'status' => 'active',
    ]);
    $package = packageRecord([
        'courses' => [$course],
    ]);

    $transactionId = DB::table('transactions')->insertGetId([
        'user_id' => $student->id,
        'course_id' => null,
        'package_id' => $package->id,
        'enrollment_id' => null,
        'invoice_number' => 'INV-PENDING-PACKAGE-001',
        'amount' => 15000,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
        'payment_gateway_ref' => null,
        'paid_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($student)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentDashboard')
            ->has('transactions', 1)
            ->where('transactions.0.id', $transactionId)
            ->where('transactions.0.payment_status', 'pending')
            ->has('availablePackages', 1));
});

test('student dengan paket aktif dapat membuka dashboard siswa', function () {
    $student = studentUser();
    $course = courseRecord([
        'status' => 'active',
    ]);
    $package = packageRecord([
        'courses' => [$course],
    ]);

    app(PackageEnrollmentService::class)->enroll($student, $package);

    $this->actingAs($student)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('StudentDashboard')
            ->has('enrollments', 1)
            ->where('enrollments.0.package.name', $package->name));
});
