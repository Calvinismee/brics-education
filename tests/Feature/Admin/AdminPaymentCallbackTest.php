<?php

use App\Models\Transaction;
use App\Support\DatabaseBoolean;
use Illuminate\Support\Facades\DB;

function signedMidtransPayloadForAdminTest(array $overrides = []): array
{
    $payload = array_merge([
        'order_id' => 'INV-CALLBACK-001',
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

test('TC_ADMIN_CALLBACK_001 callback pembayaran success mengubah transaksi dan memberi notifikasi admin', function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    $admin = adminUser();
    $student = studentUser([
        'name' => 'Siswa Callback',
    ]);
    $course = courseRecord([
        'title' => 'Penalaran Umum',
        'status' => 'active',
    ]);

    transactionRecord([
        'student' => $student,
        'course' => $course,
        'invoice_number' => 'INV-CALLBACK-001',
        'amount' => 15000,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
        'payment_gateway_ref' => 'snap-token-callback',
        'paid_at' => null,
    ]);

    $this->postJson(route('midtrans.notification'), signedMidtransPayloadForAdminTest())
        ->assertOk()
        ->assertJson(['message' => 'OK']);

    $transaction = Transaction::query()
        ->where('invoice_number', 'INV-CALLBACK-001')
        ->firstOrFail();

    expect($transaction->payment_status)->toBe('success');
    expect($transaction->payment_method)->toBe('qris');
    expect($transaction->paid_at)->not->toBeNull();
    expect($transaction->enrollment_id)->not->toBeNull();

    $this->assertDatabaseHas('enrollments', [
        'id' => $transaction->enrollment_id,
        'user_id' => $student->id,
        'course_id' => $course['id'],
        'status' => 'active',
    ]);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'title' => 'Pembayaran Berhasil',
        'message' => 'Siswa Callback berhasil membayar Penalaran Umum. Invoice: INV-CALLBACK-001.',
        'is_read' => DatabaseBoolean::value(false),
    ]);
});

test('TC_ADMIN_CALLBACK_002 callback transaction ID invalid ditolak dan tidak mengubah transaksi', function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    adminUser();
    $student = studentUser();
    $course = courseRecord([
        'title' => 'Pengetahuan Kuantitatif',
        'status' => 'active',
    ]);

    transactionRecord([
        'student' => $student,
        'course' => $course,
        'invoice_number' => 'INV-CALLBACK-VALID',
        'amount' => 15000,
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    $this->postJson(route('midtrans.notification'), signedMidtransPayloadForAdminTest([
        'order_id' => 'INV-CALLBACK-MISSING',
    ]))
        ->assertNotFound()
        ->assertJson(['message' => 'Transaction not found']);

    $this->assertDatabaseHas('transactions', [
        'invoice_number' => 'INV-CALLBACK-VALID',
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    expect(DB::table('enrollments')->where('user_id', $student->id)->count())->toBe(0);
    expect(DB::table('notifications')->where('title', 'Pembayaran Berhasil')->count())->toBe(0);
});

test('TC_ADMIN_CALLBACK_003 callback pembayaran gagal mengubah transaksi tanpa aktivasi layanan', function (string $midtransStatus) {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    $admin = adminUser();
    $student = studentUser([
        'name' => 'Siswa Gagal',
    ]);
    $course = courseRecord([
        'title' => 'Literasi Bahasa Inggris',
        'status' => 'active',
    ]);

    transactionRecord([
        'student' => $student,
        'course' => $course,
        'invoice_number' => 'INV-CALLBACK-FAILED',
        'amount' => 15000,
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    $this->postJson(route('midtrans.notification'), signedMidtransPayloadForAdminTest([
        'order_id' => 'INV-CALLBACK-FAILED',
        'transaction_status' => $midtransStatus,
    ]))
        ->assertOk()
        ->assertJson(['message' => 'OK']);

    $this->assertDatabaseHas('transactions', [
        'invoice_number' => 'INV-CALLBACK-FAILED',
        'payment_status' => 'failed',
        'paid_at' => null,
        'enrollment_id' => null,
    ]);

    expect(DB::table('enrollments')->where('user_id', $student->id)->count())->toBe(0);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'title' => 'Pembayaran Gagal',
        'message' => 'Siswa Gagal mengalami kegagalan pembayaran untuk Literasi Bahasa Inggris. Invoice: INV-CALLBACK-FAILED.',
        'is_read' => DatabaseBoolean::value(false),
    ]);
})->with(['deny', 'cancel', 'failure']);

test('TC_ADMIN_CALLBACK_004 callback pembayaran expire dicatat sebagai kedaluwarsa', function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    $admin = adminUser();
    $student = studentUser([
        'name' => 'Siswa Expired',
    ]);
    $course = courseRecord([
        'title' => 'Pengetahuan Kuantitatif',
        'status' => 'active',
    ]);

    transactionRecord([
        'student' => $student,
        'course' => $course,
        'invoice_number' => 'INV-CALLBACK-EXPIRED',
        'amount' => 15000,
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    $this->postJson(route('midtrans.notification'), signedMidtransPayloadForAdminTest([
        'order_id' => 'INV-CALLBACK-EXPIRED',
        'transaction_status' => 'expire',
    ]))
        ->assertOk()
        ->assertJson(['message' => 'OK']);

    $this->assertDatabaseHas('transactions', [
        'invoice_number' => 'INV-CALLBACK-EXPIRED',
        'payment_status' => 'expired',
        'paid_at' => null,
        'enrollment_id' => null,
    ]);

    expect(DB::table('enrollments')->where('user_id', $student->id)->count())->toBe(0);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'title' => 'Pembayaran Kedaluwarsa',
        'message' => 'Siswa Expired melewati batas waktu pembayaran untuk Pengetahuan Kuantitatif. Invoice: INV-CALLBACK-EXPIRED.',
        'is_read' => DatabaseBoolean::value(false),
    ]);
});

test('TC_ADMIN_CALLBACK_005 callback capture challenge tetap pending dan tidak mengaktifkan layanan', function () {
    config(['services.midtrans.server_key' => 'SB-Mid-server-test']);

    adminUser();
    $student = studentUser();
    $course = courseRecord([
        'title' => 'Penalaran Matematika',
        'status' => 'active',
    ]);

    transactionRecord([
        'student' => $student,
        'course' => $course,
        'invoice_number' => 'INV-CALLBACK-CHALLENGE',
        'amount' => 15000,
        'payment_status' => 'pending',
        'paid_at' => null,
    ]);

    $this->postJson(route('midtrans.notification'), signedMidtransPayloadForAdminTest([
        'order_id' => 'INV-CALLBACK-CHALLENGE',
        'transaction_status' => 'capture',
        'fraud_status' => 'challenge',
    ]))
        ->assertOk()
        ->assertJson(['message' => 'OK']);

    $this->assertDatabaseHas('transactions', [
        'invoice_number' => 'INV-CALLBACK-CHALLENGE',
        'payment_status' => 'pending',
        'paid_at' => null,
        'enrollment_id' => null,
    ]);

    expect(DB::table('enrollments')->where('user_id', $student->id)->count())->toBe(0);
});
