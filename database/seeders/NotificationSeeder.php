<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = DB::table('users')->where('role', 'admin')->value('id');

        if (!$adminId) {
            return;
        }

        $now = Carbon::now();

        $notifications = [
            [
                'title' => 'Transaksi Baru',
                'message' => 'Siswa Budi Santosa telah melakukan pembayaran untuk kursus Matematika Dasar sebesar Rp 149.000',
                'created_at' => $now->copy()->subDays(2),
            ],
            [
                'title' => 'Kursus Baru Ditambahkan',
                'message' => 'Tutor Brics telah menambahkan konten baru untuk kursus IPA Terpadu',
                'created_at' => $now->copy()->subDays(1),
            ],
            [
                'title' => 'Pengguna Baru',
                'message' => 'Ada 5 pengguna siswa baru yang mendaftar hari ini',
                'created_at' => $now,
            ],
            [
                'title' => 'Jadwal Kelas Ditambahkan',
                'message' => 'Jadwal kelas Bahasa Indonesia telah dijadwalkan untuk 13 Mei 2026 jam 13:00',
                'created_at' => $now->copy()->subHours(3),
            ],
            [
                'title' => 'Pembayaran Tertunda',
                'message' => 'Ada 2 pembayaran yang masih pending dan perlu diverifikasi',
                'created_at' => $now->copy()->subHours(6),
            ],
            [
                'title' => 'Konten Menunggu Persetujuan',
                'message' => 'Ada 1 materi yang menunggu persetujuan Anda',
                'created_at' => $now->copy()->subDays(1),
            ],
        ];

        foreach ($notifications as $notification) {
            DB::table('notifications')->updateOrInsert(
                [
                    'user_id' => $adminId,
                    'title' => $notification['title'],
                ],
                [
                    'user_id' => $adminId,
                    'title' => $notification['title'],
                    'message' => $notification['message'],
                    'is_read' => false,
                    'created_at' => $notification['created_at'],
                    'updated_at' => $notification['created_at'],
                ]
            );
        }
    }
}
