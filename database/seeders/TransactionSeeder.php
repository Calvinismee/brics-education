<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Services\PackageEnrollmentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $studentIds = DB::table('users')
            ->whereIn('email', [
                'siswa@bricsedu.id',
                'siswa2@bricsedu.id',
                'siswa3@bricsedu.id',
            ])
            ->pluck('id', 'email');

        $packages = Package::query()
            ->whereIn('name', ['Paket Dasar', 'Paket Intensif', 'Paket Premium'])
            ->get()
            ->keyBy('name');

        $now = Carbon::now();
        $samples = [
            ['invoice' => 'INV-20251201-0001', 'student_email' => 'siswa@bricsedu.id', 'package' => 'Paket Dasar', 'amount' => 149000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 160],
            ['invoice' => 'INV-20251215-0002', 'student_email' => 'siswa2@bricsedu.id', 'package' => 'Paket Intensif', 'amount' => 249000, 'method' => 'gopay', 'status' => 'success', 'days_ago' => 145],
            ['invoice' => 'INV-20260105-0003', 'student_email' => 'siswa3@bricsedu.id', 'package' => 'Paket Premium', 'amount' => 399000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 123],
            ['invoice' => 'INV-20260120-0004', 'student_email' => 'siswa@bricsedu.id', 'package' => 'Paket Intensif', 'amount' => 249000, 'method' => 'ovo', 'status' => 'failed', 'days_ago' => 108],
            ['invoice' => 'INV-20260208-0005', 'student_email' => 'siswa2@bricsedu.id', 'package' => 'Paket Dasar', 'amount' => 149000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 89],
            ['invoice' => 'INV-20260215-0006', 'student_email' => 'siswa3@bricsedu.id', 'package' => 'Paket Premium', 'amount' => 399000, 'method' => 'gopay', 'status' => 'success', 'days_ago' => 82],
            ['invoice' => 'INV-20260228-0007', 'student_email' => 'siswa@bricsedu.id', 'package' => 'Paket Intensif', 'amount' => 249000, 'method' => 'qris', 'status' => 'success', 'days_ago' => 69],
            ['invoice' => 'INV-20260310-0008', 'student_email' => 'siswa2@bricsedu.id', 'package' => 'Paket Premium', 'amount' => 399000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 59],
            ['invoice' => 'INV-20260320-0009', 'student_email' => 'siswa3@bricsedu.id', 'package' => 'Paket Dasar', 'amount' => 149000, 'method' => 'ovo', 'status' => 'success', 'days_ago' => 49],
            ['invoice' => 'INV-20260325-0010', 'student_email' => 'siswa@bricsedu.id', 'package' => 'Paket Premium', 'amount' => 399000, 'method' => 'gopay', 'status' => 'pending', 'days_ago' => 44],
            ['invoice' => 'INV-20260405-0011', 'student_email' => 'siswa2@bricsedu.id', 'package' => 'Paket Intensif', 'amount' => 249000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 33],
            ['invoice' => 'INV-20260415-0012', 'student_email' => 'siswa3@bricsedu.id', 'package' => 'Paket Dasar', 'amount' => 149000, 'method' => 'qris', 'status' => 'success', 'days_ago' => 23],
            ['invoice' => 'INV-20260420-0013', 'student_email' => 'siswa@bricsedu.id', 'package' => 'Paket Intensif', 'amount' => 249000, 'method' => 'ovo', 'status' => 'failed', 'days_ago' => 18],
            ['invoice' => 'INV-20260428-0014', 'student_email' => 'siswa2@bricsedu.id', 'package' => 'Paket Premium', 'amount' => 399000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 10],
            ['invoice' => 'INV-20260501-0015', 'student_email' => 'siswa3@bricsedu.id', 'package' => 'Paket Dasar', 'amount' => 149000, 'method' => 'gopay', 'status' => 'success', 'days_ago' => 7],
            ['invoice' => 'INV-20260505-0016', 'student_email' => 'siswa@bricsedu.id', 'package' => 'Paket Premium', 'amount' => 399000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 3],
            ['invoice' => 'INV-20260507-0017', 'student_email' => 'siswa2@bricsedu.id', 'package' => 'Paket Intensif', 'amount' => 249000, 'method' => 'qris', 'status' => 'pending', 'days_ago' => 1],
        ];

        foreach ($samples as $sample) {
            $userId = $studentIds[$sample['student_email']] ?? null;
            $package = $packages->get($sample['package']);

            if (! $userId || ! $package) {
                continue;
            }

            $txDate = $now->copy()->subDays($sample['days_ago']);

            $existing = DB::table('transactions')
                ->where('invoice_number', $sample['invoice'])
                ->first();

            DB::table('transactions')->updateOrInsert(
                ['invoice_number' => $sample['invoice']],
                [
                    'user_id' => $userId,
                    'course_id' => null,
                    'package_id' => $package->id,
                    'enrollment_id' => null,
                    'amount' => $sample['amount'],
                    'payment_method' => $sample['method'],
                    'payment_status' => $sample['status'],
                    'payment_gateway_ref' => null,
                    'paid_at' => $sample['status'] === 'success' ? $txDate : null,
                    'created_at' => $existing?->created_at ?? $txDate,
                    'updated_at' => $txDate,
                ]
            );

            if ($sample['status'] !== 'success') {
                continue;
            }

            $enrollments = app(PackageEnrollmentService::class)->enroll($userId, $package->id);
            $firstEnrollmentId = $enrollments->first()->id ?? null;

            DB::table('enrollments')
                ->where('user_id', $userId)
                ->where('package_id', $package->id)
                ->update([
                    'enrolled_at' => $txDate,
                    'created_at' => $txDate,
                    'updated_at' => $txDate,
                ]);

            DB::table('transactions')
                ->where('invoice_number', $sample['invoice'])
                ->update([
                    'enrollment_id' => $firstEnrollmentId,
                ]);
        }
    }
}
