<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $studentRoleId = DB::table('roles')->where('name', 'student')->value('id') ?? 1;
        $studentIds = DB::table('users')->where('role_id', $studentRoleId)->pluck('id', 'email');
        $courseIds = DB::table('courses')->pluck('id', 'title');

        $now = Carbon::now();

        // Expanded sample data with more transactions spread across months
        $samples = [
            // December 2025
            ['invoice' => 'INV-20251201-0001', 'student_email' => 'siswa@bricsedu.id', 'course' => 'Matematika Dasar', 'amount' => 149000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 160],
            ['invoice' => 'INV-20251215-0002', 'student_email' => 'siswa2@bricsedu.id', 'course' => 'Bahasa Indonesia', 'amount' => 249000, 'method' => 'gopay', 'status' => 'success', 'days_ago' => 145],
            // January 2026
            ['invoice' => 'INV-20260105-0003', 'student_email' => 'siswa3@bricsedu.id', 'course' => 'IPA Terpadu', 'amount' => 399000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 123],
            ['invoice' => 'INV-20260120-0004', 'student_email' => 'siswa@bricsedu.id', 'course' => 'Bahasa Indonesia', 'amount' => 249000, 'method' => 'ovo', 'status' => 'failed', 'days_ago' => 108],
            // February 2026
            ['invoice' => 'INV-20260208-0005', 'student_email' => 'siswa2@bricsedu.id', 'course' => 'Matematika Dasar', 'amount' => 149000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 89],
            ['invoice' => 'INV-20260215-0006', 'student_email' => 'siswa3@bricsedu.id', 'course' => 'IPA Terpadu', 'amount' => 399000, 'method' => 'gopay', 'status' => 'success', 'days_ago' => 82],
            ['invoice' => 'INV-20260228-0007', 'student_email' => 'siswa@bricsedu.id', 'course' => 'Bahasa Indonesia', 'amount' => 249000, 'method' => 'qris', 'status' => 'success', 'days_ago' => 69],
            // March 2026
            ['invoice' => 'INV-20260310-0008', 'student_email' => 'siswa2@bricsedu.id', 'course' => 'IPA Terpadu', 'amount' => 399000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 59],
            ['invoice' => 'INV-20260320-0009', 'student_email' => 'siswa3@bricsedu.id', 'course' => 'Matematika Dasar', 'amount' => 149000, 'method' => 'ovo', 'status' => 'success', 'days_ago' => 49],
            ['invoice' => 'INV-20260325-0010', 'student_email' => 'siswa@bricsedu.id', 'course' => 'IPA Terpadu', 'amount' => 399000, 'method' => 'gopay', 'status' => 'pending', 'days_ago' => 44],
            // April 2026
            ['invoice' => 'INV-20260405-0011', 'student_email' => 'siswa2@bricsedu.id', 'course' => 'Bahasa Indonesia', 'amount' => 249000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 33],
            ['invoice' => 'INV-20260415-0012', 'student_email' => 'siswa3@bricsedu.id', 'course' => 'Matematika Dasar', 'amount' => 149000, 'method' => 'qris', 'status' => 'success', 'days_ago' => 23],
            ['invoice' => 'INV-20260420-0013', 'student_email' => 'siswa@bricsedu.id', 'course' => 'Bahasa Indonesia', 'amount' => 249000, 'method' => 'ovo', 'status' => 'failed', 'days_ago' => 18],
            ['invoice' => 'INV-20260428-0014', 'student_email' => 'siswa2@bricsedu.id', 'course' => 'IPA Terpadu', 'amount' => 399000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 10],
            // May 2026 (current month)
            ['invoice' => 'INV-20260501-0015', 'student_email' => 'siswa3@bricsedu.id', 'course' => 'Matematika Dasar', 'amount' => 149000, 'method' => 'gopay', 'status' => 'success', 'days_ago' => 7],
            ['invoice' => 'INV-20260505-0016', 'student_email' => 'siswa@bricsedu.id', 'course' => 'IPA Terpadu', 'amount' => 399000, 'method' => 'bank_transfer', 'status' => 'success', 'days_ago' => 3],
            ['invoice' => 'INV-20260507-0017', 'student_email' => 'siswa2@bricsedu.id', 'course' => 'Bahasa Indonesia', 'amount' => 249000, 'method' => 'qris', 'status' => 'pending', 'days_ago' => 1],
        ];

        foreach ($samples as $s) {
            $userId = $studentIds[$s['student_email']] ?? null;
            $courseId = $courseIds[$s['course']] ?? null;

            if (! $userId || ! $courseId) {
                continue;
            }

            $txDate = $now->copy()->subDays($s['days_ago']);

            DB::table('transactions')->updateOrInsert(
                ['invoice_number' => $s['invoice']],
                [
                    'user_id' => $userId,
                    'course_id' => $courseId,
                    'invoice_number' => $s['invoice'],
                    'amount' => $s['amount'],
                    'payment_method' => $s['method'],
                    'payment_status' => $s['status'],
                    'payment_gateway_ref' => null,
                    'paid_at' => $s['status'] === 'success' ? $txDate : null,
                    'created_at' => $txDate,
                    'updated_at' => $txDate,
                ]
            );
        }
    }
}
